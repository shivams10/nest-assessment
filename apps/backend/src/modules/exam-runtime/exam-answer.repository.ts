import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSubmission(
    submissionId: string,
    userId: string,
  ): Promise<{ id: string } | null> {
    return this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        userId,
        submittedAt: null,
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  async upsertSubmissionScore(
    submissionId: string,
    questionId: string,
  ): Promise<{
    id: string;
    submissionId: string;
    questionId: string;
    marksObtained: number;
    answeredAt: Date | null;
  }> {
    return this.prisma.submissionScore.upsert({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId,
        },
      },
      create: {
        submissionId,
        questionId,
        marksObtained: 0,
        answeredAt: new Date(),
      },
      update: {
        answeredAt: new Date(),
      },
    });
  }

  deleteAnswers(submissionScoreId: string): Promise<{ count: number }> {
    return this.prisma.submissionAnswer.deleteMany({
      where: { submissionScoreId },
    });
  }

  insertAnswers(
    submissionScoreId: string,
    optionIds: string[],
  ): Promise<{ count: number }> {
    return this.prisma.submissionAnswer.createMany({
      data: optionIds.map((id) => ({
        submissionScoreId,
        selectedOptionId: id,
      })),
    });
  }

  /**
   * Batch upsert submission scores in a transaction
   */
  async batchUpsertScores(
    submissionId: string,
    questionIds: string[],
  ): Promise<Map<string, string>> {
    // Use transaction to ensure atomicity
    const results = await this.prisma.$transaction(
      questionIds.map((questionId) =>
        this.prisma.submissionScore.upsert({
          where: {
            submissionId_questionId: {
              submissionId,
              questionId,
            },
          },
          create: {
            submissionId,
            questionId,
            marksObtained: 0,
            answeredAt: new Date(),
          },
          update: {
            answeredAt: new Date(),
          },
          select: {
            id: true,
            questionId: true,
          },
        }),
      ),
    );

    // Return map of questionId -> submissionScoreId
    return new Map(results.map((r) => [r.questionId, r.id]));
  }

  /**
   * Batch delete and insert answers in a transaction
   */
  async batchUpdateAnswers(
    updates: Array<{ submissionScoreId: string; optionIds: string[] }>,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Delete all existing answers for these scores
      const scoreIds = updates.map((u) => u.submissionScoreId);
      await tx.submissionAnswer.deleteMany({
        where: { submissionScoreId: { in: scoreIds } },
      });

      // Insert all new answers
      const allAnswers = updates.flatMap((update) =>
        update.optionIds.map((optionId) => ({
          submissionScoreId: update.submissionScoreId,
          selectedOptionId: optionId,
        })),
      );

      if (allAnswers.length > 0) {
        await tx.submissionAnswer.createMany({
          data: allAnswers,
        });
      }
    });
  }
}
