import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamSetsRepository } from './exam-sets.repository';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { CreateExamSetSectionDto } from './dto/create-exam-set-section.dto';
import { UpdateExamSetSectionDto } from './dto/update-exam-set-section.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamSetsService {
  constructor(
    private readonly repository: ExamSetsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async listExamSets(examId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, deletedAt: null },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.repository.findManyByExam(examId);
  }

  createExamSet(dto: CreateExamSetDto) {
    return this.repository.createSet(dto.examId, dto.name);
  }

  async deleteExamSet(setId: string) {
    const examSet = await this.prisma.examSet.findUnique({
      where: { id: setId },
      include: {
        exam: true,
      },
    });

    if (!examSet) {
      throw new NotFoundException('Exam set not found');
    }

    if (examSet.exam.isPublished) {
      throw new BadRequestException(
        'Cannot delete exam set of a published exam',
      );
    }

    return this.repository.softDelete(setId);
  }

  createExamSetSection(dto: CreateExamSetSectionDto) {
    return this.repository.createSection(
      dto.examSetId,
      dto.sectionType,
      dto.questionCount,
    );
  }

  async updateExamSetSection(
    sectionId: string,
    dto: UpdateExamSetSectionDto,
  ) {
    const section = await this.prisma.examSetSection.findUnique({
      where: { id: sectionId },
      include: {
        examSet: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Exam set section not found');
    }

    if (section.examSet.exam.isPublished) {
      throw new BadRequestException(
        'Cannot update section of a published exam',
      );
    }

    return this.repository.updateSection(sectionId, dto.questionCount);
  }
}
