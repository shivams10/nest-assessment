import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamAttemptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findExistingAttempt(examId: string, userId: string) {
    return this.prisma.submission.findFirst({
      where: {
        examId,
        userId,
        deletedAt: null,
      },
    });
  }

  createAttempt(examId: string, userId: string, examSetId: string) {
    return this.prisma.submission.create({
      data: {
        examId,
        userId,
        examSetId,
        startedAt: new Date(),
      },
    });
  }

  findExamSets(examId: string) {
    return this.prisma.examSet.findMany({
      where: { examId },
      select: { id: true },
    });
  }
}
