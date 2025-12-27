import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

const SUBMISSION_PUBLIC_SELECT = {
  id: true,
  examId: true,
  examSetId: true,
  startedAt: true,
  submittedAt: true,
  autoSubmitted: true,
  createdAt: true,
} as const;

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
      select: SUBMISSION_PUBLIC_SELECT,
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
      select: SUBMISSION_PUBLIC_SELECT,
    });
  }

  findExamSets(examId: string) {
    return this.prisma.examSet.findMany({
      where: { examId },
      select: { id: true },
    });
  }
}
