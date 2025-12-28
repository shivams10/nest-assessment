import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamSetQuestionsRepository } from './exam-set-questions.repository';
import { AddExamSetQuestionsDto } from './dto/add-exam-set-questions.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamSetQuestionsService {
  constructor(
    private readonly repo: ExamSetQuestionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getSectionQuestions(sectionId: string) {
    const section = await this.prisma.examSetSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Exam set section not found');
    }

    const assignedQuestions = await this.repo.findAssignedQuestions(sectionId);
    const availableQuestions = await this.repo.findAvailableQuestions(
      section.sectionType,
      sectionId,
    );

    return {
      assignedQuestions,
      availableQuestions,
    };
  }

  async addQuestions(dto: AddExamSetQuestionsDto) {
    const section = await this.prisma.examSetSection.findUnique({
      where: { id: dto.examSetSectionId },
    });

    if (!section) {
      throw new BadRequestException('Exam section not found');
    }

    const existingCount = await this.repo.countBySection(dto.examSetSectionId);

    if (existingCount + dto.questionIds.length > section.questionCount) {
      throw new BadRequestException(
        'Exceeds allowed number of questions for this section',
      );
    }

    const existing = await this.repo.findExisting(
      dto.examSetSectionId,
      dto.questionIds,
    );

    if (existing.length > 0) {
      throw new BadRequestException(
        'Some questions are already added to this section',
      );
    }

    await this.repo.addMany(dto.examSetSectionId, dto.questionIds);

    return { addedCount: dto.questionIds.length };
  }
}
