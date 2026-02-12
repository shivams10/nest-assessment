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

  findExistingAttempt(
    examId: string,
    userId: string,
  ): Promise<{
    id: string;
    examId: string;
    examSetId: string;
    startedAt: Date | null;
    submittedAt: Date | null;
    autoSubmitted: boolean;
    createdAt: Date;
  } | null> {
    return this.prisma.submission.findFirst({
      where: {
        examId,
        userId,
        deletedAt: null,
      },
      select: SUBMISSION_PUBLIC_SELECT,
    });
  }

  createAttempt(
    examId: string,
    userId: string,
    examSetId: string,
  ): Promise<{
    id: string;
    examId: string;
    examSetId: string;
    startedAt: Date | null;
    submittedAt: Date | null;
    autoSubmitted: boolean;
    createdAt: Date;
  }> {
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

  findExamSets(examId: string): Promise<Array<{ id: string }>> {
    return this.prisma.examSet.findMany({
      where: { examId },
      select: { id: true },
    });
  }

  findExamForValidation(examId: string): Promise<{
    id: string;
    isPublished: boolean;
    windowStartsAt: Date | null;
    windowEndsAt: Date | null;
  } | null> {
    return this.prisma.exam.findFirst({
      where: {
        id: examId,
        deletedAt: null,
      },
      select: {
        id: true,
        isPublished: true,
        windowStartsAt: true,
        windowEndsAt: true,
      },
    });
  }
}
