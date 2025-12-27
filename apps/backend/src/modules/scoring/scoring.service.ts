import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ScoringContext, QuestionWithAnswers } from './scoring.types';
import { QuestionCategory, QuestionType } from '@prisma/client';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Entry point — SAFE & IDEMPOTENT
   */
  async scoreSubmission(context: ScoringContext): Promise<void> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: context.submissionId },
      include: {
        finalResult: true,
      },
    });

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

    await this.prisma.finalResult.create({
      data: {
        submissionId: submission.id,
        totalMarks,
        aptitudeMarks,
        technicalMarks,
        tabSwitchCount: 0, // updated later via monitoring
        screenshotTaken: false,
        kicked: false,
        selectedForNextRound: false,
      },
    });

    this.logger.log(`Scoring completed for submission ${submission.id}`);
  }

  /**
   * Fetch questions + answers in ONE optimized query
   */
  private async loadQuestionsWithAnswers(
    submissionId: string,
  ): Promise<QuestionWithAnswers[]> {
    const scores = await this.prisma.submissionScore.findMany({
      where: { submissionId },
      include: {
        answers: true,
      },
    });

    const questionIds = scores.map((s) => s.questionId);

    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: {
        options: true,
      },
    });

    return scores.map((score) => {
      const question = questions.find((q) => q.id === score.questionId);

      if (!question) {
        throw new Error('Question not found during scoring');
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
