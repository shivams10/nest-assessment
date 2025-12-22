import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ExamRepository } from './exam.repository';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListExamsDto, ExamStatusFilter } from './dto/list-exams.dto';
@Injectable()
export class ExamService {
  constructor(private readonly examRepository: ExamRepository) {}

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

    return this.examRepository.publish(examId);
  }

  async createExam(dto: CreateExamDto, createdBy: string) {
    const windowStartsAt = new Date(dto.windowStartsAt);
    const windowEndsAt = new Date(dto.windowEndsAt);

    if (windowStartsAt >= windowEndsAt) {
      throw new BadRequestException('Exam end time must be after start time');
    }

    const masterPasswordHash = await bcrypt.hash(dto.masterPassword, 10);

    return this.examRepository.create({
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

      session: {
        connect: { id: dto.collegeSessionId },
      },
    });
  }

  async listExamsForAdmin(dto: ListExamsDto) {
    const skip = (dto.page - 1) * dto.limit;

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
      take: dto.limit,
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

    return this.examRepository.unpublish(examId);
  }
}
