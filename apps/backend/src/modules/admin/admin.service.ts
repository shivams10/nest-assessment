import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { ListResultsDto } from './dto/list-results.dto';
import { USER_PUBLIC_SELECT } from './constants/user-public.select';
import { ScoringService } from '../scoring/scoring.service';
import { ResultForAdmin } from '../scoring/scoring.repository';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const admin = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'admin',
        passwordHash,
      },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(`Admin created: userId=${admin.id}, email=${admin.email}`);

    return admin;
  }

  async createModerator(dto: CreateModeratorDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const moderator = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'moderator',
        passwordHash,
      },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(
      `Moderator created: userId=${moderator.id}, email=${moderator.email}`,
    );

    return moderator;
  }

  async setUserActive(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(
      `User status updated: userId=${userId}, isActive=${isActive}, role=${updated.role}`,
    );

    return updated;
  }

  async softDeleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deleted = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(
      `User soft deleted: userId=${userId}, email=${deleted.email}, role=${deleted.role}`,
    );

    return deleted;
  }

  async setUserPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    this.logger.log(`Password set for user: userId=${userId}, email=${user.email}`);
    return { success: true, message: 'Password updated' };
  }

  async listUsers(dto: ListUsersDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(dto.role ? { role: dto.role } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_PUBLIC_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubmissionResult(submissionId: string) {
    const result =
      await this.scoringService.getFinalResultForSubmission(submissionId);
    if (!result) {
      throw new NotFoundException('Result not found for this submission');
    }
    return result;
  }

  async listResults(dto: ListResultsDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    // Normalize selectedForNextRound - handle string "true"/"false" from query params
    // Query params come as strings, so we need to convert them explicitly
    let selectedForNextRound: boolean | undefined = undefined;

    // Use 'any' to handle cases where Transform might not have converted string to boolean
    const rawValue: any = dto.selectedForNextRound;
    this.logger.log(
      `[DEBUG] ListResults - rawValue: ${JSON.stringify(rawValue)}, type: ${typeof rawValue}, dto.selectedForNextRound: ${JSON.stringify(dto.selectedForNextRound)}`,
    );

    if (rawValue !== undefined && rawValue !== null) {
      if (typeof rawValue === 'boolean') {
        // Already a boolean (true or false)
        selectedForNextRound = rawValue;
        this.logger.log(`[DEBUG] Set from boolean: ${selectedForNextRound}`);
      } else if (typeof rawValue === 'string') {
        // String from query param - convert explicitly
        const lowercased = rawValue.toLowerCase().trim();
        this.logger.log(
          `[DEBUG] Processing string: "${rawValue}" -> "${lowercased}"`,
        );
        if (lowercased === 'true' || lowercased === '1') {
          selectedForNextRound = true;
        } else if (lowercased === 'false' || lowercased === '0') {
          selectedForNextRound = false;
          this.logger.log(`[DEBUG] Converted string "false" to boolean false`);
        }
        // If it's neither 'true' nor 'false', leave as undefined
      } else if (typeof rawValue === 'number') {
        // Number (0 or 1)
        selectedForNextRound = rawValue === 1;
      }
    }

    this.logger.log(
      `[DEBUG] Final normalized value: selectedForNextRound=${selectedForNextRound} (type: ${typeof selectedForNextRound})`,
    );

    const { items, total } = await this.scoringService.listResults({
      examId: dto.examId,
      collegeSessionId: dto.collegeSessionId,
      selectedForNextRound,
      skip,
      take: limit,
    });

    // Fetch candidate info for each result
    const userIds = items.map((item: ResultForAdmin) => item.submission.userId);
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const candidateMap = new Map(
      candidates.map((c) => [
        c.id,
        { email: c.email, firstName: c.firstName, lastName: c.lastName },
      ]),
    );

    const formattedItems = items.map((item) => ({
      submissionId: item.submission.id,
      examId: item.submission.exam.id,
      examTitle: item.submission.exam.title,
      candidate: candidateMap.get(item.submission.userId) ?? {
        email: null,
        firstName: null,
        lastName: null,
      },
      totalMarks: item.totalMarks,
      aptitudeMarks: item.aptitudeMarks,
      technicalMarks: item.technicalMarks,
      selectedForNextRound: item.selectedForNextRound,
      rank: item.rank,
      submittedAt: item.submission.submittedAt,
      createdAt: item.createdAt,
    }));

    return {
      items: formattedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleNextRoundSelection(
    submissionId: string,
    selectedForNextRound: boolean,
  ): Promise<{ success: boolean; selectedForNextRound: boolean }> {
    // Verify submission exists
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Verify final result exists
    const finalResult = await this.prisma.finalResult.findUnique({
      where: { submissionId },
      select: { id: true },
    });

    if (!finalResult) {
      throw new NotFoundException('Final result not found for this submission');
    }

    return this.scoringService.updateSelectedForNextRound(
      submissionId,
      selectedForNextRound,
    );
  }
}
