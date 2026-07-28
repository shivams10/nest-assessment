import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ResumeParsingService } from '../ai/services/resume-parsing.service';
import { CreateInterviewCandidateDto } from './dto/create-interview-candidate.dto';
import { ListInterviewCandidatesDto } from './dto/list-interview-candidates.dto';
import {
  INTERVIEW_CANDIDATE_DETAIL_SELECT,
  INTERVIEW_CANDIDATE_LIST_SELECT,
} from './constants/interview-candidate.select';
import { extractResumeText } from './utils/extract-resume-text.util';

@Injectable()
export class InterviewCandidatesService {
  private readonly logger = new Logger(InterviewCandidatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resumeParsingService: ResumeParsingService,
  ) {}

  async createCandidate(
    addedBy: string,
    dto: CreateInterviewCandidateDto,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    const existing = await this.prisma.candidate.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Candidate already exists');
    }

    const candidate = await this.prisma.candidate.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        roleApplyingFor: dto.roleApplyingFor,
        referredBy: dto.referredBy,
        resumeUrl: file.path,
        addedBy,
      },
      select: INTERVIEW_CANDIDATE_DETAIL_SELECT,
    });

    // Best-effort AI parse — never let a parsing failure fail candidate
    // creation, which has already succeeded at this point.
    try {
      // diskStorage doesn't populate file.buffer — read the saved file back.
      const buffer = await readFile(file.path);
      const text = await extractResumeText(buffer, file.mimetype);
      if (text) {
        const parsed = await this.resumeParsingService.parseResumeText(text);

        return await this.prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            phone: candidate.phone ?? parsed.phone ?? undefined,
            skills: parsed.skills,
            education: parsed.education as unknown as Prisma.InputJsonValue,
            yearsOfExperience: parsed.yearsOfExperience ?? undefined,
          },
          select: INTERVIEW_CANDIDATE_DETAIL_SELECT,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Resume parsing failed for candidate ${candidate.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return candidate;
  }

  async listCandidates(dto: ListInterviewCandidatesDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.search
        ? {
            OR: [
              { name: { contains: dto.search, mode: 'insensitive' as const } },
              { email: { contains: dto.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: INTERVIEW_CANDIDATE_LIST_SELECT,
      }),
      this.prisma.candidate.count({ where }),
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

  async getCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, deletedAt: null },
      select: INTERVIEW_CANDIDATE_DETAIL_SELECT,
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async getResumeFile(id: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, deletedAt: null },
      select: { name: true, resumeUrl: true },
    });

    if (!candidate || !candidate.resumeUrl) {
      throw new NotFoundException('Resume not found');
    }

    return {
      path: resolve(candidate.resumeUrl),
      candidateName: candidate.name,
    };
  }
}
