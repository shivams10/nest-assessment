import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { ExamRepository } from './exam.repository';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ListExamsDto, ExamStatusFilter } from './dto/list-exams.dto';

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(
    private readonly examRepository: ExamRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * List published exams for a session
   */
  getPublishedExams(collegeSessionId: string) {
    return this.examRepository.findPublishedBySession(collegeSessionId);
  }

  /**
   * List published exams for a candidate based on their assigned session
   * Only returns exams that are currently within their window dates
   */
  async listExamsForCandidate(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { collegeSessionId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If candidate has no session assigned, return empty list
    if (!user.collegeSessionId) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };
    }

    // Get published exams for the candidate's session
    const exams = await this.examRepository.findPublishedBySession(
      user.collegeSessionId,
    );

    // Get submissions for this user
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        examId: true,
        submittedAt: true,
      },
    });

    // Create a map of examId -> submission
    const submissionMap = new Map(submissions.map((s) => [s.examId, s]));

    // Filter exams that are within their window dates
    const now = new Date();
    const availableExams = exams
      .filter((exam) => {
        if (!exam.windowStartsAt || !exam.windowEndsAt) {
          return false; // Skip exams without window dates
        }

        const windowStart = new Date(exam.windowStartsAt);
        const windowEnd = new Date(exam.windowEndsAt);

        // Exam is available if current time is within the window
        return now >= windowStart && now <= windowEnd;
      })
      .map((exam) => {
        const submission = submissionMap.get(exam.id);
        return {
          ...exam,
          submissionId: submission?.id || null,
          submittedAt: submission?.submittedAt || null,
        };
      });

    return {
      data: availableExams,
      total: availableExams.length,
      page: 1,
      limit: 20,
    };
  }

  /**
   * Validate exam readiness for publishing
   * Returns validation result with reasons
   */
  async validateExamReadiness(examId: string): Promise<{
    isReady: boolean;
    reasons: string[];
  }> {
    const exam = await this.examRepository.findById(examId);

    if (!exam) {
      return {
        isReady: false,
        reasons: ['Exam not found'],
      };
    }

    const reasons: string[] = [];

    // Validate exam sets
    const examSets = await this.prisma.examSet.findMany({
      where: { examId },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (examSets.length === 0) {
      reasons.push('At least one exam set is required');
      return { isReady: false, reasons };
    }

    // Validate each exam set
    for (const examSet of examSets) {
      const aptitudeSection = examSet.sections.find(
        (s) => s.sectionType === 'aptitude',
      );
      const technicalSection = examSet.sections.find(
        (s) => s.sectionType === 'technical',
      );

      if (!aptitudeSection) {
        reasons.push(`Exam set "${examSet.name}" is missing aptitude section`);
      } else {
        const aptitudeAssignedCount = aptitudeSection.questions.length;
        if (aptitudeAssignedCount < aptitudeSection.questionCount) {
          reasons.push(
            `Exam set "${examSet.name}" aptitude section requires ${aptitudeSection.questionCount} questions but only ${aptitudeAssignedCount} are assigned`,
          );
        }
      }

      if (!technicalSection) {
        reasons.push(`Exam set "${examSet.name}" is missing technical section`);
      } else {
        const technicalAssignedCount = technicalSection.questions.length;
        if (technicalAssignedCount < technicalSection.questionCount) {
          reasons.push(
            `Exam set "${examSet.name}" technical section requires ${technicalSection.questionCount} questions but only ${technicalAssignedCount} are assigned`,
          );
        }
      }
    }

    return {
      isReady: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Publish an exam after validation
   */
  async publishExam(examId: string) {
    const exam = await this.examRepository.findById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Validate exam readiness
    const validation = await this.validateExamReadiness(examId);

    if (!validation.isReady) {
      throw new BadRequestException({
        code: 'EXAM_NOT_READY',
        message: 'Exam is not ready to be published',
        reasons: validation.reasons,
      });
    }

    const updated = await this.examRepository.publish(examId);

    this.logger.log(
      `Exam published: examId=${examId}, title=${updated.title}, collegeSessionId=${updated.collegeSessionId}`,
    );

    return updated;
  }

  async createExam(dto: CreateExamDto, createdBy: string) {
    const windowStartsAt = new Date(dto.windowStartsAt);
    const windowEndsAt = new Date(dto.windowEndsAt);

    if (windowStartsAt >= windowEndsAt) {
      throw new BadRequestException('Exam end time must be after start time');
    }

    // Validate session exists and is not completed if provided
    if (dto.collegeSessionId) {
      const session = await this.prisma.recruitmentSession.findFirst({
        where: {
          id: dto.collegeSessionId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new NotFoundException('Recruitment session not found');
      }

      if (session.endDate && session.endDate < new Date()) {
        throw new BadRequestException(
          'Cannot create exam for a session that has ended',
        );
      }
    }

    const masterPasswordHash = await bcrypt.hash(dto.masterPassword, 10);

    const createData: Prisma.ExamCreateInput = {
      title: dto.title,
      description: dto.description,
      windowStartsAt,
      windowEndsAt,
      durationSeconds: dto.durationSeconds,
      masterPasswordHash,
      masterPasswordPlain: dto.masterPassword,
      isPublished: false,
      creator: {
        connect: { id: createdBy },
      },
      ...(dto.collegeSessionId && {
        session: {
          connect: { id: dto.collegeSessionId },
        },
      }),
    };

    const exam = await this.examRepository.create(createData);

    this.logger.log(
      `Exam created: examId=${exam.id}, title=${exam.title}, createdBy=${createdBy}, collegeSessionId=${dto.collegeSessionId || 'none'}`,
    );

    return exam;
  }

  async listExamsForAdmin(dto: ListExamsDto) {
    // Ensure page and limit are numbers (query params come as strings)
    // Handle both string and number types, with proper fallbacks
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

    // Ensure we have valid numbers (not NaN)
    const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const limit = isNaN(limitNum) || limitNum < 1 ? 20 : limitNum;
    const skip = (page - 1) * limit;

    let isPublished: boolean | undefined;

    if (dto.status === ExamStatusFilter.published) {
      isPublished = true;
    }

    if (dto.status === ExamStatusFilter.draft) {
      isPublished = false;
    }

    return this.examRepository.findForAdmin({
      collegeSessionId: dto.collegeSessionId,
      isPublished,
      skip,
      take: limit,
    });
  }

  async unpublishExam(examId: string) {
    const exam = await this.examRepository.findById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (!exam.isPublished) {
      throw new BadRequestException('Exam is already in draft state');
    }

    const now = new Date();
    const hasStarted = exam.windowStartsAt && exam.windowStartsAt <= now;
    const hasEnded = exam.windowEndsAt && exam.windowEndsAt <= now;
    const isLive = hasStarted && !hasEnded;
    if (isLive) {
      throw new BadRequestException('Cannot unpublish a live exam');
    }

    const updated = await this.examRepository.unpublish(examId);

    this.logger.log(
      `Exam unpublished: examId=${examId}, title=${updated.title}, collegeSessionId=${updated.collegeSessionId}`,
    );

    return updated;
  }

  async findByIdForAdmin(id: string) {
    const exam = await this.examRepository.findById(id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.examRepository.findByIdForAdmin(id);
  }

  async updateExam(id: string, dto: UpdateExamDto) {
    const exam = await this.examRepository.findById(id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Only DRAFT exams can be edited
    if (exam.isPublished) {
      throw new BadRequestException('Cannot edit a published exam');
    }

    // Validate dates if both provided
    if (dto.windowStartsAt && dto.windowEndsAt) {
      const windowStartsAt = new Date(dto.windowStartsAt);
      const windowEndsAt = new Date(dto.windowEndsAt);

      if (windowStartsAt >= windowEndsAt) {
        throw new BadRequestException('Exam end time must be after start time');
      }
    }

    // Validate session exists and is not completed if provided
    if (dto.collegeSessionId) {
      const session = await this.prisma.recruitmentSession.findFirst({
        where: {
          id: dto.collegeSessionId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new NotFoundException('Recruitment session not found');
      }

      if (session.endDate && session.endDate < new Date()) {
        throw new BadRequestException(
          'Cannot assign exam to a session that has ended',
        );
      }
    }

    const updateData: Prisma.ExamUpdateInput = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.windowStartsAt !== undefined)
      updateData.windowStartsAt = dto.windowStartsAt
        ? new Date(dto.windowStartsAt)
        : null;
    if (dto.windowEndsAt !== undefined)
      updateData.windowEndsAt = dto.windowEndsAt
        ? new Date(dto.windowEndsAt)
        : null;
    if (dto.durationSeconds !== undefined)
      updateData.durationSeconds = dto.durationSeconds;
    if (dto.collegeSessionId !== undefined) {
      if (dto.collegeSessionId) {
        updateData.session = { connect: { id: dto.collegeSessionId } };
      } else {
        updateData.session = { disconnect: true };
      }
    }
    if (dto.masterPassword !== undefined && dto.masterPassword !== '') {
      updateData.masterPasswordHash = await bcrypt.hash(dto.masterPassword, 10);
      updateData.masterPasswordPlain = dto.masterPassword;
    }

    const updated = await this.examRepository.update(id, updateData);

    this.logger.log(`Exam updated: examId=${id}, title=${updated.title}`);

    return updated;
  }

  async deleteExam(examId: string) {
    const exam = await this.examRepository.findById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Only DRAFT exams can be deleted
    if (exam.isPublished) {
      throw new BadRequestException(
        'Cannot delete a published exam. Unpublish it first.',
      );
    }

    const deleted = await this.examRepository.softDelete(examId);

    this.logger.log(`Exam deleted: examId=${examId}, title=${exam.title}`);

    return deleted;
  }
}
