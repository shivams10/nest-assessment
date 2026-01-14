import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ScoringRepository, ResultForAdmin } from './scoring.repository';
import { ScoringContext, QuestionWithAnswers } from './scoring.types';
import { QuestionCategory, QuestionType } from '@prisma/client';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly repository: ScoringRepository) {}

  /**
   * Entry point — SAFE & IDEMPOTENT
   */
  async scoreSubmission(context: ScoringContext): Promise<void> {
    const submission = await this.repository.findSubmissionWithRelations(
      context.submissionId,
    );

    if (!submission) {
      return;
    }

    // ❌ Do NOT score incomplete submissions
    if (!submission.submittedAt) {
      return;
    }

    // ❌ Already scored → idempotent exit
    if (submission.finalResult) {
      return;
    }

    const questions = await this.loadQuestionsWithAnswers(context.submissionId);

    const { totalMarks, aptitudeMarks, technicalMarks } =
      this.calculateMarks(questions);

    await this.repository.createFinalResult({
      submissionId: submission.id,
      totalMarks,
      aptitudeMarks,
      technicalMarks,
    });

    this.logger.log(`Scoring completed for submission ${submission.id}`);
  }

  /**
   * Get final result for a submission (public fields only)
   */
  async getFinalResultForSubmission(submissionId: string): Promise<{
    totalMarks: number;
    aptitudeMarks: number;
    technicalMarks: number;
    selectedForNextRound: boolean;
    rank: number | null;
  } | null> {
    return this.repository.findFinalResultBySubmissionId(submissionId);
  }

  /**
   * List results with filters for admin
   */
  async listResults(filters: {
    examId?: string;
    collegeSessionId?: string;
    selectedForNextRound?: boolean;
    skip: number;
    take: number;
  }): Promise<{ items: ResultForAdmin[]; total: number }> {
    return this.repository.findResultsWithFilters(filters);
  }

  /**
   * Update selectedForNextRound for a submission
   */
  async updateSelectedForNextRound(
    submissionId: string,
    selectedForNextRound: boolean,
  ): Promise<{ success: boolean; selectedForNextRound: boolean }> {
    await this.repository.updateSelectedForNextRound(
      submissionId,
      selectedForNextRound,
    );

    this.logger.log(
      `Updated selectedForNextRound for submission ${submissionId}: ${selectedForNextRound}`,
    );

    return {
      success: true,
      selectedForNextRound,
    };
  }

  /**
   * Calculate and update ranks for an exam
   * - Ranks by totalMarks (descending)
   * - Tie-breaker 1: technicalMarks (descending)
   * - Tie-breaker 2: earlier submittedAt (ascending)
   * - Safe to re-run (idempotent)
   * - Processes in batches to prevent memory overload
   */
  async calculateRanksForExam(examId: string): Promise<void> {
    const BATCH_SIZE = 1000;
    const totalCount = await this.repository.countResultsForExamRanking(examId);

    if (totalCount === 0) {
      this.logger.log(`No results found for exam ${examId}`);
      return;
    }

    this.logger.log(
      `Starting rank calculation for exam ${examId}: ${totalCount} results to process`,
    );

    let currentRank = 1;
    let skip = 0;
    let previousResult: {
      totalMarks: number;
      technicalMarks: number;
      submittedAt: Date | null;
    } | null = null;

    while (skip < totalCount) {
      const batch = await this.repository.findResultsForExamRankingBatch(
        examId,
        skip,
        BATCH_SIZE,
      );

      if (batch.length === 0) {
        break;
      }

      // Sort batch by submittedAt as tie-breaker when marks are equal
      const sortedBatch = [...batch].sort((a, b) => {
        // If marks are equal, use submittedAt as tie-breaker
        if (
          a.totalMarks === b.totalMarks &&
          a.technicalMarks === b.technicalMarks
        ) {
          const aTime = a.submission.submittedAt?.getTime() ?? Infinity;
          const bTime = b.submission.submittedAt?.getTime() ?? Infinity;
          return aTime - bTime; // Earlier submission gets better rank
        }
        // Otherwise maintain DB sort order
        return 0;
      });

      const updates: Array<{ finalResultId: string; rank: number }> = [];

      for (let i = 0; i < sortedBatch.length; i++) {
        const result = sortedBatch[i];
        const resultTime = result.submission.submittedAt?.getTime() ?? Infinity;

        // Determine if this result should have the same rank as previous
        if (i === 0 && previousResult !== null) {
          // Check if first result of batch ties with last result of previous batch
          const prevTime = previousResult.submittedAt?.getTime() ?? Infinity;
          const isSame =
            previousResult.totalMarks === result.totalMarks &&
            previousResult.technicalMarks === result.technicalMarks &&
            prevTime === resultTime;

          if (!isSame) {
            currentRank = skip + i + 1;
          }
          // If same, keep currentRank from previous batch
        } else if (i > 0) {
          // Check if this result differs from previous in batch
          const prev = sortedBatch[i - 1];
          const prevTime = prev.submission.submittedAt?.getTime() ?? Infinity;

          const isSame =
            prev.totalMarks === result.totalMarks &&
            prev.technicalMarks === result.technicalMarks &&
            prevTime === resultTime;

          if (!isSame) {
            currentRank = skip + i + 1;
          }
        } else {
          // First result of first batch
          currentRank = 1;
        }

        updates.push({
          finalResultId: result.id,
          rank: currentRank,
        });
      }

      // Update ranks for this batch
      await this.repository.updateRanksBatch(updates);

      // Store last result for next batch tie-breaker check
      if (sortedBatch.length > 0) {
        const lastResult = sortedBatch[sortedBatch.length - 1];
        previousResult = {
          totalMarks: lastResult.totalMarks,
          technicalMarks: lastResult.technicalMarks,
          submittedAt: lastResult.submission.submittedAt,
        };
      }

      this.logger.log(
        `Processed batch: examId=${examId}, batch=${Math.floor(skip / BATCH_SIZE) + 1}, results=${updates.length}, rankRange=${updates[0]?.rank}-${updates[updates.length - 1]?.rank}`,
      );

      skip += BATCH_SIZE;
    }

    this.logger.log(
      `Completed rank calculation for exam ${examId}: ${totalCount} results processed`,
    );
  }

  /**
   * Fetch questions + answers using repository
   */
  private async loadQuestionsWithAnswers(
    submissionId: string,
  ): Promise<QuestionWithAnswers[]> {
    const scores =
      await this.repository.findSubmissionScoresWithAnswers(submissionId);

    const questionIds = scores.map((s) => s.questionId);

    const questions =
      await this.repository.findQuestionsWithOptions(questionIds);

    return scores.map((score) => {
      const question = questions.find((q) => q.id === score.questionId);

      if (!question) {
        const errorMessage = `Question ${score.questionId} not found during scoring for submission ${submissionId}`;
        this.logger.error(errorMessage);
        throw new InternalServerErrorException(
          'Failed to load question data during scoring',
        );
      }

      return {
        questionId: question.id,
        category: question.category,
        type: question.type,
        points: question.points,
        correctOptionIds: question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id),
        selectedOptionIds: score.answers.map((a) => a.selectedOptionId),
      };
    });
  }

  /**
   * PURE FUNCTION — easy to test
   */
  private calculateMarks(questions: QuestionWithAnswers[]) {
    let totalMarks = 0;
    let aptitudeMarks = 0;
    let technicalMarks = 0;

    for (const q of questions) {
      const isCorrect = this.evaluateQuestion(q);

      if (!isCorrect) continue;

      totalMarks += q.points;

      if (q.category === QuestionCategory.aptitude) {
        aptitudeMarks += q.points;
      }

      if (q.category === QuestionCategory.technical) {
        technicalMarks += q.points;
      }
    }

    return {
      totalMarks,
      aptitudeMarks,
      technicalMarks,
    };
  }

  /**
   * Handles both single & multi-select
   */
  private evaluateQuestion(q: QuestionWithAnswers): boolean {
    if (q.type === QuestionType.single_select) {
      return (
        q.selectedOptionIds.length === 1 &&
        q.correctOptionIds.includes(q.selectedOptionIds[0])
      );
    }

    // multi_select → exact match
    const selected = new Set(q.selectedOptionIds);
    const correct = new Set(q.correctOptionIds);

    if (selected.size !== correct.size) {
      return false;
    }

    for (const id of correct) {
      if (!selected.has(id)) {
        return false;
      }
    }

    return true;
  }
}
