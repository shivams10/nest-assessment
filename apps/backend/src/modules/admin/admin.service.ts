import {
  Injectable,
  ConflictException,
  NotFoundException,
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

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'admin',
        passwordHash,
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  async createModerator(dto: CreateModeratorDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'moderator',
        passwordHash,
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  async setUserActive(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: USER_PUBLIC_SELECT,
    });
  }

  async softDeleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
      select: USER_PUBLIC_SELECT,
    });
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

  async listResults(dto: ListResultsDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const { items, total } = await this.scoringService.listResults({
      examId: dto.examId,
      collegeSessionId: dto.collegeSessionId,
      selectedForNextRound: dto.selectedForNextRound,
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
}
