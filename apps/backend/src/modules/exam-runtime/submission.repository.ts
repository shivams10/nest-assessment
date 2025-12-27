import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

export type ActiveSubmissionWithExam = {
  id: string;
  userId: string;
  exam: {
    windowStartsAt: Date | null;
    durationSeconds: number;
  };
};

@Injectable()
export class SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveSubmission(
    submissionId: string,
  ): Promise<ActiveSubmissionWithExam | null> {
    return this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        submittedAt: null,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        exam: {
          select: {
            windowStartsAt: true,
            durationSeconds: true,
          },
        },
      },
    });
  }

  async autoSubmit(submissionId: string): Promise<void> {
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        submittedAt: new Date(),
        autoSubmitted: true,
      },
    });
  }

  async markSubmitted(submissionId: string, autoSubmitted: boolean) {
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        submittedAt: new Date(),
        autoSubmitted,
      },
    });
  }

  /**
   * Find submission by ID and userId to validate ownership
   */
  async findSubmissionByIdAndUserId(submissionId: string, userId: string) {
    return this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        submittedAt: true,
      },
    });
  }

  /**
   * Find active submissions that have expired based on exam timing
   */
  async findExpiredActiveSubmissions() {
    return this.prisma.submission.findMany({
      where: {
        submittedAt: null,
        deletedAt: null,
        exam: {
          durationSeconds: { gt: 0 },
        },
      },
      select: {
        id: true,
        startedAt: true,
        exam: {
          select: {
            windowStartsAt: true,
            durationSeconds: true,
          },
        },
      },
    });
  }
}
