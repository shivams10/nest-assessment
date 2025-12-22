import { Injectable } from '@nestjs/common';
import { ExamSetsRepository } from './exam-sets.repository';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { CreateExamSetSectionDto } from './dto/create-exam-set-section.dto';

@Injectable()
export class ExamSetsService {
  constructor(private readonly repository: ExamSetsRepository) {}

  createExamSet(dto: CreateExamSetDto) {
    return this.repository.createSet(dto.examId, dto.name);
  }

  createExamSetSection(dto: CreateExamSetSectionDto) {
    return this.repository.createSection(
      dto.examSetId,
      dto.sectionType,
      dto.questionCount,
    );
  }
}
