import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserRole } from '@prisma/client';

import { CreateCandidateDto } from './dto/create-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { CANDIDATE_PUBLIC_SELECT } from './constants/candidate-public.select';

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCandidate(dto: CreateCandidateDto) {
    const sessionExists = await this.prisma.recruitmentSession.findUnique({
      where: { id: dto.collegeSessionId },
    });

    if (!sessionExists) {
      throw new NotFoundException('Recruitment session not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Candidate already exists');
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'candidate',
        collegeSessionId: dto.collegeSessionId,
        passwordHash: null,
      },
      select: CANDIDATE_PUBLIC_SELECT,
    });
  }

  async listCandidates(dto: ListCandidatesDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const where = {
      role: UserRole.candidate,
      deletedAt: null,
      ...(dto.collegeSessionId
        ? { collegeSessionId: dto.collegeSessionId }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: CANDIDATE_PUBLIC_SELECT,
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

  async activateCandidate(candidateId: string) {
    const candidate = await this.prisma.user.findFirst({
      where: {
        id: candidateId,
        role: UserRole.candidate,
        deletedAt: null,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.user.update({
      where: { id: candidateId },
      data: { isActive: true },
      select: CANDIDATE_PUBLIC_SELECT,
    });
  }

  async deactivateCandidate(candidateId: string) {
    const candidate = await this.prisma.user.findFirst({
      where: {
        id: candidateId,
        role: UserRole.candidate,
        deletedAt: null,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.user.update({
      where: { id: candidateId },
      data: { isActive: false },
      select: CANDIDATE_PUBLIC_SELECT,
    });
  }
}
