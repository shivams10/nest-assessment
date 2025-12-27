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
}
