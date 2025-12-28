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
   * Publish an exam after validation
   */
  async publishExam(examId: string) {
    const exam = await this.examRepository.findById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Validate exam readiness
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
      throw new BadRequestException(
        'Cannot publish exam: At least one exam set is required',
      );
    }

    for (const examSet of examSets) {
      const aptitudeSection = examSet.sections.find(
        (s) => s.sectionType === 'aptitude',
      );
      const technicalSection = examSet.sections.find(
        (s) => s.sectionType === 'technical',
      );

      if (!aptitudeSection) {
        throw new BadRequestException(
          `Cannot publish exam: Exam set "${examSet.name}" is missing aptitude section`,
        );
      }

      if (!technicalSection) {
        throw new BadRequestException(
          `Cannot publish exam: Exam set "${examSet.name}" is missing technical section`,
        );
      }

      const aptitudeAssignedCount = aptitudeSection.questions.length;
      if (aptitudeAssignedCount < aptitudeSection.questionCount) {
        throw new BadRequestException(
          `Cannot publish exam: Exam set "${examSet.name}" aptitude section requires ${aptitudeSection.questionCount} questions but only ${aptitudeAssignedCount} are assigned`,
        );
      }

      const technicalAssignedCount = technicalSection.questions.length;
      if (technicalAssignedCount < technicalSection.questionCount) {
        throw new BadRequestException(
          `Cannot publish exam: Exam set "${examSet.name}" technical section requires ${technicalSection.questionCount} questions but only ${technicalAssignedCount} are assigned`,
        );
      }
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

    // Validate session exists if provided
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
    }

    const masterPasswordHash = await bcrypt.hash(dto.masterPassword, 10);

    const createData: Prisma.ExamCreateInput = {
      title: dto.title,
      description: dto.description,
      windowStartsAt,
      windowEndsAt,
      durationSeconds: dto.durationSeconds,
      masterPasswordHash,
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

    if (exam.windowStartsAt && exam.windowStartsAt <= new Date()) {
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

    // Validate session exists if provided
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
