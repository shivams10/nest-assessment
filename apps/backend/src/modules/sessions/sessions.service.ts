import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { InterviewerCalendarService } from '../calendar/interviewer-calendar.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { SESSION_INCLUDE } from './constants/session.include';

type AvailabilityResult = { available: boolean; reason?: string };

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarService: CalendarService,
    private readonly interviewerCalendarService: InterviewerCalendarService,
  ) {}

  async createSession(callerId: string, dto: CreateSessionDto) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: dto.candidateId, deletedAt: null },
      select: { id: true, name: true, email: true, roleApplyingFor: true },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const interviewer = await this.prisma.user.findFirst({
      where: {
        id: dto.interviewerId,
        role: 'interviewer',
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, email: true },
    });
    if (!interviewer) {
      throw new NotFoundException('Interviewer not found');
    }

    const room = dto.roomId
      ? await this.prisma.meetingRoom.findFirst({
          where: { id: dto.roomId, isActive: true },
          select: { id: true, resourceEmail: true },
        })
      : null;
    if (dto.roomId && !room) {
      throw new NotFoundException('Room not found');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    const durationMinutes = dto.durationMinutes ?? 60;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60_000);

    const interviewerBusy = await this.hasOverlap(
      { interviewerId: dto.interviewerId },
      scheduledAt,
      endTime,
    );
    if (interviewerBusy) {
      throw new ConflictException(
        'Interviewer is already booked for this time slot',
      );
    }

    // Best-effort: only meaningful if this interviewer has connected their
    // own calendar. `null` means "can't determine" — never blocks on it.
    const realConflict = await this.interviewerCalendarService.hasConflict(
      dto.interviewerId,
      scheduledAt,
      endTime,
    );
    if (realConflict === true) {
      throw new ConflictException(
        'Interviewer has a conflicting event on their calendar at this time',
      );
    }

    if (room) {
      const roomBusy = await this.hasOverlap(
        { roomId: room.id },
        scheduledAt,
        endTime,
      );
      if (roomBusy) {
        throw new ConflictException(
          'Room is already booked for this time slot',
        );
      }
    }

    const session = await this.prisma.interviewSession.create({
      data: {
        candidateId: candidate.id,
        interviewerId: interviewer.id,
        scheduledById: callerId,
        roomId: room?.id,
        scheduledAt,
        durationMinutes,
      },
      include: SESSION_INCLUDE,
    });

    // Best-effort — a session is still valid without a synced calendar event.
    try {
      const attendeeEmails = [candidate.email, interviewer.email];
      if (room?.resourceEmail) attendeeEmails.push(room.resourceEmail);

      const { meetLink, googleCalendarEventId } =
        await this.calendarService.createEvent({
          summary: `Interview: ${candidate.name} — ${candidate.roleApplyingFor}`,
          description: 'Scheduled via the Interview Portal.',
          startTime: scheduledAt,
          endTime,
          attendeeEmails,
        });

      const updated = await this.prisma.interviewSession.update({
        where: { id: session.id },
        data: { meetLink, googleCalendarEventId },
        include: SESSION_INCLUDE,
      });

      await this.markCandidateScheduled(candidate.id);
      return updated;
    } catch (error) {
      this.logger.warn(
        `Calendar sync failed for session ${session.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await this.markCandidateScheduled(candidate.id);
      return session;
    }
  }

  private async markCandidateScheduled(candidateId: string): Promise<void> {
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'interview_scheduled' },
    });
  }

  async listSessions(callerId: string, callerRole: string) {
    const where: Prisma.InterviewSessionWhereInput =
      callerRole === 'interviewer' ? { interviewerId: callerId } : {};

    return this.prisma.interviewSession.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: SESSION_INCLUDE,
    });
  }

  async checkAvailability(
    dto: CheckAvailabilityDto,
  ): Promise<AvailabilityResult> {
    const scheduledAt = new Date(dto.scheduledAt);
    const durationMinutes = dto.durationMinutes ?? 60;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60_000);

    if (
      await this.hasOverlap(
        { interviewerId: dto.interviewerId },
        scheduledAt,
        endTime,
      )
    ) {
      return {
        available: false,
        reason: 'Interviewer is already booked for this time',
      };
    }

    const realConflict = await this.interviewerCalendarService.hasConflict(
      dto.interviewerId,
      scheduledAt,
      endTime,
    );
    if (realConflict === true) {
      return {
        available: false,
        reason: 'Interviewer has a conflicting event on their calendar',
      };
    }

    if (
      dto.roomId &&
      (await this.hasOverlap({ roomId: dto.roomId }, scheduledAt, endTime))
    ) {
      return {
        available: false,
        reason: 'Room is already booked for this time',
      };
    }

    return { available: true };
  }

  /**
   * Prisma can't compare `scheduledAt + durationMinutes` against a value in a
   * WHERE clause, so the end-time boundary is filtered in application code.
   * Bounded by `scheduledAt < newEnd` first to keep the candidate set small.
   */
  private async hasOverlap(
    scopeWhere: Prisma.InterviewSessionWhereInput,
    newStart: Date,
    newEnd: Date,
  ): Promise<boolean> {
    const candidates = await this.prisma.interviewSession.findMany({
      where: {
        ...scopeWhere,
        status: { not: 'cancelled' },
        scheduledAt: { lt: newEnd },
      },
      select: { scheduledAt: true, durationMinutes: true },
    });

    return candidates.some((s) => {
      const existingEnd = new Date(
        s.scheduledAt.getTime() + s.durationMinutes * 60_000,
      );
      return existingEnd > newStart;
    });
  }
}
