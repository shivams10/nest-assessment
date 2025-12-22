import { Injectable, ForbiddenException } from '@nestjs/common';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ExamAnswerRepository } from './exam-answer.repository';
import { SubmissionTimeService } from './submission-time.service';

@Injectable()
export class ExamAnswerService {
  constructor(
    private readonly repo: ExamAnswerRepository,
    private readonly submissionTime: SubmissionTimeService,
  ) {}

  async submitAnswers(dto: SubmitAnswersDto, userId: string) {
    await this.submissionTime.assertSubmissionActive(dto.submissionId);

    const submission = await this.repo.findSubmission(dto.submissionId, userId);

    if (!submission) {
      throw new ForbiddenException('Invalid submission');
    }

    for (const answer of dto.answers) {
      const score = await this.repo.upsertSubmissionScore(
        dto.submissionId,
        answer.questionId,
      );

      await this.repo.deleteAnswers(score.id);
      await this.repo.insertAnswers(score.id, answer.selectedOptionIds);
    }

    return { success: true };
  }
}
