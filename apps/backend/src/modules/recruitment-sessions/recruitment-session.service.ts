import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RecruitmentSessionRepository } from './recruitment-session.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ListSessionsDto } from './dto/list-sessions.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class RecruitmentSessionService {
  private readonly logger = new Logger(RecruitmentSessionService.name);

  constructor(
    private readonly repository: RecruitmentSessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Calculate session status based on current date and session dates
   */
  private calculateStatus(
    startDate: Date | null,
    endDate: Date | null,
  ): SessionStatus | null {
    if (!startDate || !endDate) {
      return null; // Cannot calculate without both dates
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) {
      return SessionStatus.active;
    } else if (now > end) {
      return SessionStatus.completed;
    } else {
      return SessionStatus.upcoming;
    }
  }

  /**
   * Ensure session status is up-to-date based on dates
   */
  private async ensureStatusIsCurrent(session: {
    id: string;
    startDate: Date | null;
    endDate: Date | null;
    status: SessionStatus;
  }): Promise<void> {
    const calculatedStatus = this.calculateStatus(
      session.startDate,
      session.endDate,
    );

    if (
      calculatedStatus &&
      calculatedStatus !== session.status &&
      session.startDate &&
      session.endDate
    ) {
      // Status is outdated, update it
      await this.repository.update(session.id, {
        status: calculatedStatus,
      });
      this.logger.log(
        `Auto-updated session status: id=${session.id}, old=${session.status}, new=${calculatedStatus}`,
      );
    }
  }

  async create(dto: CreateSessionDto, createdBy: string) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Determine status based on dates
    const status =
      this.calculateStatus(startDate, endDate) || SessionStatus.upcoming;

    // Validate college exists if provided
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });

      if (!college) {
        throw new NotFoundException('College not found');
      }
    }

    const session = await this.repository.create({
      name: dto.name,
      year: dto.year,
      startDate,
      endDate,
      status,
      collegeId: dto.collegeId || null,
      createdBy,
    });

    this.logger.log(
      `Recruitment session created: id=${session.id}, name=${session.name}`,
    );

    return session;
  }

  async list(dto: ListSessionsDto) {
    const pageNum = dto.page
      ? typeof dto.page === 'string'
        ? parseInt(dto.page, 10)
        : Number(dto.page)
      : 1;
    const limitNum = dto.limit
      ? typeof dto.limit === 'string'
        ? parseInt(dto.limit, 10)
        : Number(dto.limit)
      : 20;

    const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const limit = isNaN(limitNum) || limitNum < 1 ? 20 : limitNum;
    const skip = (page - 1) * limit;

    const result = await this.repository.findMany({
      status: dto.status,
      collegeId: dto.collegeId,
      skip,
      take: limit,
    });

    // Ensure all sessions have up-to-date status
    await Promise.all(
      result.items.map((session) => this.ensureStatusIsCurrent(session)),
    );

    // Re-fetch if any statuses were updated (to return correct status)
    const needsRefetch = result.items.some((session) => {
      const calculatedStatus = this.calculateStatus(
        session.startDate,
        session.endDate,
      );
      return (
        calculatedStatus &&
        calculatedStatus !== session.status &&
        session.startDate &&
        session.endDate
      );
    });

    if (needsRefetch) {
      return this.repository.findMany({
        status: dto.status,
        collegeId: dto.collegeId,
        skip,
        take: limit,
      });
    }

    return result;
  }

  async findById(id: string) {
    const session = await this.repository.findById(id);
    await this.ensureStatusIsCurrent(session);
    // Re-fetch to get updated status if it was changed
    return this.repository.findById(id);
  }

  async update(id: string, dto: UpdateSessionDto) {
    // Validate dates if both provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate college exists if provided
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });

      if (!college) {
        throw new NotFoundException('College not found');
      }
    }

    // Auto-update status if dates are provided
    let status = dto.status;
    if (dto.startDate || dto.endDate || !status) {
      const existing = await this.repository.findById(id);
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : existing.startDate
          ? new Date(existing.startDate)
          : null;
      const endDate = dto.endDate
        ? new Date(dto.endDate)
        : existing.endDate
          ? new Date(existing.endDate)
          : null;

      if (startDate && endDate) {
        status = this.calculateStatus(startDate, endDate) || status;
      }
    }

    const updateData: {
      name?: string;
      year?: number;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: SessionStatus;
      collegeId?: string | null;
    } = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.year !== undefined) updateData.year = dto.year;
    if (dto.startDate !== undefined)
      updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined)
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (dto.collegeId !== undefined)
      updateData.collegeId = dto.collegeId || null;

    const session = await this.repository.update(id, updateData);

    this.logger.log(`Recruitment session updated: id=${session.id}`);

    return session;
  }

  async delete(id: string) {
    const session = await this.repository.softDelete(id);

    this.logger.log(`Recruitment session deleted: id=${session.id}`);

    return session;
  }
}
