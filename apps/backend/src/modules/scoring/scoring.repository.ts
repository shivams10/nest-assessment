import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

const submissionSelect = {
  id: true,
  submittedAt: true,
  exam: {
    select: {
      id: true,
      title: true,
    },
  },
  finalResult: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.SubmissionSelect;

export type SubmissionWithRelations = Prisma.SubmissionGetPayload<{
  select: typeof submissionSelect;
}>;

const submissionScoreSelect = {
  id: true,
  questionId: true,
  answers: {
    select: {
      selectedOptionId: true,
    },
  },
} satisfies Prisma.SubmissionScoreSelect;

export type SubmissionScoreWithAnswers = Prisma.SubmissionScoreGetPayload<{
  select: typeof submissionScoreSelect;
}>;

const questionSelect = {
  id: true,
  category: true,
  type: true,
  points: true,
  options: {
    select: {
      id: true,
      isCorrect: true,
    },
  },
} satisfies Prisma.QuestionSelect;

export type QuestionWithOptions = Prisma.QuestionGetPayload<{
  select: typeof questionSelect;
}>;

const resultForAdminSelect = {
  totalMarks: true,
  aptitudeMarks: true,
  technicalMarks: true,
  selectedForNextRound: true,
  rank: true,
  createdAt: true,
  submission: {
    select: {
      id: true,
      submittedAt: true,
      exam: {
        select: {
          id: true,
          title: true,
        },
      },
      userId: true,
    },
  },
} as const;

export type ResultForAdmin = {
  totalMarks: number;
  aptitudeMarks: number;
  technicalMarks: number;
  selectedForNextRound: boolean;
  rank: number | null;
  createdAt: Date;
  submission: {
    id: string;
    submittedAt: Date | null;
    exam: {
      id: string;
      title: string;
    };
    userId: string;
  };
};

@Injectable()
export class ScoringRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch submission with exam and finalResult
   */
  async findSubmissionWithRelations(
    submissionId: string,
  ): Promise<SubmissionWithRelations | null> {
    return this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: submissionSelect,
    });
  }

  /**
   * Fetch submission scores with answers
   */
  async findSubmissionScoresWithAnswers(
    submissionId: string,
  ): Promise<SubmissionScoreWithAnswers[]> {
    return this.prisma.submissionScore.findMany({
      where: { submissionId },
      select: submissionScoreSelect,
    });
  }

  /**
   * Fetch questions with options by question IDs
   */
  async findQuestionsWithOptions(
    questionIds: string[],
  ): Promise<QuestionWithOptions[]> {
    return this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: questionSelect,
    });
  }

  /**
   * Check if FinalResult already exists for a submission
   */
  async hasFinalResult(submissionId: string): Promise<boolean> {
    const result = await this.prisma.finalResult.findUnique({
      where: { submissionId },
      select: { id: true },
    });

    return result !== null;
  }

  /**
   * Fetch FinalResult for a submission (public fields only)
   */
  async findFinalResultBySubmissionId(submissionId: string): Promise<{
    totalMarks: number;
    aptitudeMarks: number;
    technicalMarks: number;
    selectedForNextRound: boolean;
    rank: number | null;
  } | null> {
    return this.prisma.finalResult.findUnique({
      where: { submissionId },
      select: {
        totalMarks: true,
        aptitudeMarks: true,
        technicalMarks: true,
        selectedForNextRound: true,
        rank: true,
      },
    });
  }

  /**
   * Create final result for a submission
   */
  async createFinalResult(data: {
    submissionId: string;
    totalMarks: number;
    aptitudeMarks: number;
    technicalMarks: number;
  }): Promise<{
    id: string;
    submissionId: string;
    totalMarks: number;
    aptitudeMarks: number;
    technicalMarks: number;
    tabSwitchCount: number;
    screenshotTaken: boolean;
    kicked: boolean;
    selectedForNextRound: boolean;
    rank: number | null;
    createdAt: Date;
  }> {
    return this.prisma.finalResult.create({
      data: {
        submissionId: data.submissionId,
        totalMarks: data.totalMarks,
        aptitudeMarks: data.aptitudeMarks,
        technicalMarks: data.technicalMarks,
        // TODO: populate from MonitoringEvent aggregation
        tabSwitchCount: 0,
        screenshotTaken: false,
        kicked: false,
        selectedForNextRound: false,
      },
    });
  }

  /**
   * Find results with filters for admin listing
   */
  async findResultsWithFilters(filters: {
    examId?: string;
    collegeSessionId?: string;
    selectedForNextRound?: boolean;
    skip: number;
    take: number;
  }): Promise<{ items: ResultForAdmin[]; total: number }> {
    const { examId, collegeSessionId, selectedForNextRound, skip, take } =
      filters;

    const where: {
      selectedForNextRound?: boolean;
      submission: {
        deletedAt: null;
        examId?: string;
        exam?: {
          collegeSessionId?: string;
        };
      };
    } = {
      submission: {
        deletedAt: null,
        ...(examId && { examId }),
        ...(collegeSessionId && {
          exam: {
            collegeSessionId,
          },
        }),
      },
      ...(typeof selectedForNextRound === 'boolean' && {
        selectedForNextRound,
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.finalResult.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: resultForAdminSelect,
      }),
      this.prisma.finalResult.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Find all final results for an exam, ordered by ranking criteria
   */
  async findResultsForExamRanking(examId: string): Promise<
    Array<{
      id: string;
      submissionId: string;
      totalMarks: number;
      technicalMarks: number;
      submission: {
        submittedAt: Date | null;
      };
    }>
  > {
    return this.prisma.finalResult.findMany({
      where: {
        submission: {
          examId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        submissionId: true,
        totalMarks: true,
        technicalMarks: true,
        submission: {
          select: {
            submittedAt: true,
          },
        },
      },
      orderBy: [{ totalMarks: 'desc' }, { technicalMarks: 'desc' }],
    });
  }

  /**
   * Find results for exam ranking in batches
   * Returns batch of results with consistent ordering
   */
  async findResultsForExamRankingBatch(
    examId: string,
    skip: number,
    take: number,
  ): Promise<
    Array<{
      id: string;
      submissionId: string;
      totalMarks: number;
      technicalMarks: number;
      submission: {
        submittedAt: Date | null;
      };
    }>
  > {
    return this.prisma.finalResult.findMany({
      where: {
        submission: {
          examId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        submissionId: true,
        totalMarks: true,
        technicalMarks: true,
        submission: {
          select: {
            submittedAt: true,
          },
        },
      },
      orderBy: [{ totalMarks: 'desc' }, { technicalMarks: 'desc' }],
      skip,
      take,
    });
  }

  /**
   * Count total results for an exam
   */
  async countResultsForExamRanking(examId: string): Promise<number> {
    return this.prisma.finalResult.count({
      where: {
        submission: {
          examId,
          deletedAt: null,
        },
      },
    });
  }

  /**
   * Update rank for a final result
   */
  async updateRank(
    finalResultId: string,
    rank: number,
  ): Promise<{
    id: string;
    submissionId: string;
    totalMarks: number;
    aptitudeMarks: number;
    technicalMarks: number;
    tabSwitchCount: number;
    screenshotTaken: boolean;
    kicked: boolean;
    selectedForNextRound: boolean;
    rank: number | null;
    createdAt: Date;
  }> {
    return this.prisma.finalResult.update({
      where: { id: finalResultId },
      data: { rank } as Prisma.FinalResultUncheckedUpdateInput,
    });
  }

  /**
   * Batch update ranks for multiple results
   */
  async updateRanksBatch(
    updates: Array<{ finalResultId: string; rank: number }>,
  ): Promise<
    Array<{
      id: string;
      submissionId: string;
      totalMarks: number;
      aptitudeMarks: number;
      technicalMarks: number;
      tabSwitchCount: number;
      screenshotTaken: boolean;
      kicked: boolean;
      selectedForNextRound: boolean;
      rank: number | null;
      createdAt: Date;
    }>
  > {
    return this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.finalResult.update({
          where: { id: update.finalResultId },
          data: { rank: update.rank } as Prisma.FinalResultUncheckedUpdateInput,
        }),
      ),
    );
  }
}
