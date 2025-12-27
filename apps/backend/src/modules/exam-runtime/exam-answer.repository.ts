import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSubmission(submissionId: string, userId: string) {
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

  async upsertSubmissionScore(submissionId: string, questionId: string) {
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

  deleteAnswers(submissionScoreId: string) {
    return this.prisma.submissionAnswer.deleteMany({
      where: { submissionScoreId },
    });
  }

  insertAnswers(submissionScoreId: string, optionIds: string[]) {
    return this.prisma.submissionAnswer.createMany({
      data: optionIds.map((id) => ({
        submissionScoreId,
        selectedOptionId: id,
      })),
    });
  }
}
