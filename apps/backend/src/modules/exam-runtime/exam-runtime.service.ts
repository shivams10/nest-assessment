import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ExamRuntimeRepository } from './exam-runtime.repository';
import { GetExamDto } from './dto/get-exam.dto';

@Injectable()
export class ExamRuntimeService {
  constructor(private readonly repo: ExamRuntimeRepository) {}

  async getExam(
    dto: GetExamDto,
    userId: string,
  ): Promise<{
    submissionId: string;
    examSetId: string;
    examSetName: string;
    startedAt: Date | null;
    sections: Array<{
      id: string;
      type: string;
      questions: Array<{
        id: string;
        stem: string;
        type: string;
        category: string;
        options: Array<{ id: string; optionText: string }>;
      }>;
    }>;
  }> {
    // 1. Validate submission ownership
    const submission = await this.repo.findSubmission(dto.submissionId, userId);

    if (!submission) {
      throw new ForbiddenException('Submission not found');
    }

    // 2. Load locked exam set
    const examSet = await this.repo.getExamSetStructure(submission.examSetId);

    if (!examSet) {
      throw new NotFoundException('Exam set not found');
    }

    // 3. Shape response for frontend
    return {
      submissionId: submission.id,
      examSetId: examSet.id,
      examSetName: examSet.name,
      startedAt: submission.startedAt,
      sections: examSet.sections.map((section) => ({
        id: section.id,
        type: section.sectionType,
        questions: section.questions.map((q) => ({
          id: q.question.id,
          stem: q.question.stem,
          type: q.question.type,
          category: q.question.category,
          options: q.question.options,
        })),
      })),
    };
  }
}
