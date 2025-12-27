import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ExamAnswerRepository } from './exam-answer.repository';
import { SubmissionTimeService } from './submission-time.service';

@Injectable()
export class ExamAnswerService {
  private readonly logger = new Logger(ExamAnswerService.name);

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

    // Batch operations in transaction to avoid N+1 queries
    const questionIds = dto.answers.map((a) => a.questionId);
    const scoreMap = await this.repo.batchUpsertScores(
      dto.submissionId,
      questionIds,
    );

    // Prepare batch updates
    const updates = dto.answers
      .map((answer) => {
        const submissionScoreId = scoreMap.get(answer.questionId);
        if (!submissionScoreId) {
          this.logger.error(
            `Failed to get submission score for question ${answer.questionId} in submission ${dto.submissionId}`,
          );
          return null;
        }
        return {
          submissionScoreId,
          optionIds: answer.selectedOptionIds,
        };
      })
      .filter(
        (update): update is NonNullable<typeof update> => update !== null,
      );

    // Batch update all answers in a single transaction
    await this.repo.batchUpdateAnswers(updates);

    this.logger.log(
      `Answers submitted for submission ${dto.submissionId}, ${dto.answers.length} questions`,
    );

    return { success: true };
  }
}
