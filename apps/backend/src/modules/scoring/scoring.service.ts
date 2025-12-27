import { Injectable, Logger } from '@nestjs/common';
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
  async getFinalResultForSubmission(submissionId: string) {
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
   * Calculate and update ranks for an exam
   * - Ranks by totalMarks (descending)
   * - Tie-breaker 1: technicalMarks (descending)
   * - Tie-breaker 2: earlier submittedAt (ascending)
   * - Safe to re-run (idempotent)
   */
  async calculateRanksForExam(examId: string): Promise<void> {
    const results = await this.repository.findResultsForExamRanking(examId);

    if (results.length === 0) {
      this.logger.log(`No results found for exam ${examId}`);
      return;
    }

    // Results are already sorted by totalMarks and technicalMarks from DB
    // Sort by submittedAt as tie-breaker (earlier = better rank) when marks are equal
    const sortedResults = [...results].sort((a, b) => {
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

    // Calculate ranks based on sorted order
    const updates: Array<{ finalResultId: string; rank: number }> = [];
    let currentRank = 1;

    for (let i = 0; i < sortedResults.length; i++) {
      const result = sortedResults[i];

      // If this result is different from previous, update rank
      if (i > 0) {
        const prev = sortedResults[i - 1];
        const prevTime = prev.submission.submittedAt?.getTime() ?? Infinity;
        const currTime = result.submission.submittedAt?.getTime() ?? Infinity;

        const isSame =
          prev.totalMarks === result.totalMarks &&
          prev.technicalMarks === result.technicalMarks &&
          prevTime === currTime;

        if (!isSame) {
          currentRank = i + 1;
        }
      }

      updates.push({
        finalResultId: result.id,
        rank: currentRank,
      });
    }

    await this.repository.updateRanksBatch(updates);

    this.logger.log(
      `Calculated ranks for ${updates.length} results in exam ${examId}`,
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
        this.logger.error(
          `Question ${score.questionId} not found during scoring for submission ${submissionId}`,
        );
        throw new Error(
          `Question ${score.questionId} not found during scoring`,
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
