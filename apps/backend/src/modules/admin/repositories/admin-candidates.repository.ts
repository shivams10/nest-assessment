import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ListCandidatesDto } from '../dto/list-candidates.dto';

export interface CandidateListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  collegeSessionId: string | null;
  session: {
    id: string;
    name: string;
    status: string;
  } | null;
  submission: {
    id: string;
    submittedAt: Date | null;
    exam: {
      id: string;
      title: string;
    };
  } | null;
  finalResult: {
    totalMarks: number;
    rank: number | null;
    selectedForNextRound: boolean;
  } | null;
}

@Injectable()
export class AdminCandidatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCandidates(
    dto: ListCandidatesDto,
  ): Promise<{ items: CandidateListItem[]; total: number }> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    // Build where clause for candidates (users with role candidate)
    const candidateWhere: any = {
      role: 'candidate' as const,
      deletedAt: null,
    };

    // Filter by session directly on candidate if provided (not via submissions)
    const filterByCandidateSession = dto.collegeSessionId && !dto.examId && dto.selectedForNextRound === undefined;
    
    if (filterByCandidateSession) {
      candidateWhere.collegeSessionId = dto.collegeSessionId;
    }

    // Build where clause for submissions
    const submissionWhere: any = {};
    if (dto.examId) {
      submissionWhere.examId = dto.examId;
    }
    if (dto.collegeSessionId && !filterByCandidateSession) {
      // Filter by session via submissions (when also filtering by exam or selected status)
      submissionWhere.exam = {
        collegeSessionId: dto.collegeSessionId,
      };
    }
    if (dto.selectedForNextRound !== undefined) {
      submissionWhere.finalResult = {
        selectedForNextRound: dto.selectedForNextRound,
      };
    }

    // If filters are applied via submissions, we need to filter candidates by submission first
    if ((dto.examId || (dto.collegeSessionId && !filterByCandidateSession) || dto.selectedForNextRound !== undefined)) {
      // Get candidate IDs that have submissions matching filters
      const candidateIdsWithSubmissions = await this.prisma.submission.findMany({
        where: submissionWhere,
        distinct: ['userId'],
        select: { userId: true },
      });

      const userIds = candidateIdsWithSubmissions.map((s) => s.userId);
      const filteredTotal = await this.prisma.user.count({
        where: {
          ...candidateWhere,
          id: { in: userIds },
        },
      });

      // Get paginated candidates
      const candidates = await this.prisma.user.findMany({
        where: {
          ...candidateWhere,
          id: { in: userIds },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          collegeSessionId: true,
        },
      });

      // Fetch sessions for these candidates
      const sessionIds = candidates
        .map((c) => c.collegeSessionId)
        .filter((id): id is string => id !== null);
      const sessions = sessionIds.length > 0
        ? await this.prisma.recruitmentSession.findMany({
            where: {
              id: { in: sessionIds },
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
          })
        : [];
      const sessionMap = new Map(sessions.map((s) => [s.id, s]));

      // Fetch submissions for these candidates
      const candidateIds = candidates.map((c) => c.id);
      const submissions = await this.prisma.submission.findMany({
        where: {
          userId: { in: candidateIds },
          ...submissionWhere,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          submittedAt: true,
          exam: {
            select: {
              id: true,
              title: true,
            },
          },
          finalResult: {
            select: {
              totalMarks: true,
              rank: true,
              selectedForNextRound: true,
            },
          },
        },
      });

      // Group submissions by userId and take the first one for each user
      const submissionMap = new Map<string, typeof submissions[0]>();
      for (const submission of submissions) {
        if (!submissionMap.has(submission.userId)) {
          submissionMap.set(submission.userId, submission);
        }
      }

      const items: CandidateListItem[] = candidates.map((candidate) => {
        const submission = submissionMap.get(candidate.id) || null;
        const session = candidate.collegeSessionId
          ? sessionMap.get(candidate.collegeSessionId) || null
          : null;
        return {
          id: candidate.id,
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          isActive: candidate.isActive,
          collegeSessionId: candidate.collegeSessionId,
          session: session
            ? {
                id: session.id,
                name: session.name,
                status: session.status,
              }
            : null,
          submission: submission
            ? {
                id: submission.id,
                submittedAt: submission.submittedAt,
                exam: submission.exam,
              }
            : null,
          finalResult: submission?.finalResult
            ? {
                totalMarks: submission.finalResult.totalMarks,
                rank: submission.finalResult.rank,
                selectedForNextRound: submission.finalResult.selectedForNextRound,
              }
            : null,
        };
      });

      return {
        items,
        total: filteredTotal,
      };
    }

    // No filters - get all candidates
    const [candidates, totalCandidates] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: candidateWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          collegeSessionId: true,
        },
      }),
      this.prisma.user.count({ where: candidateWhere }),
    ]);

    // Fetch sessions for these candidates
    const sessionIds = candidates
      .map((c) => c.collegeSessionId)
      .filter((id): id is string => id !== null);
    const sessions = sessionIds.length > 0
      ? await this.prisma.recruitmentSession.findMany({
          where: {
            id: { in: sessionIds },
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            status: true,
          },
        })
      : [];
    const sessionMap = new Map(sessions.map((s) => [s.id, s]));

    // Fetch submissions for these candidates
    const candidateIds = candidates.map((c) => c.id);
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId: { in: candidateIds },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        submittedAt: true,
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
        finalResult: {
          select: {
            totalMarks: true,
            rank: true,
            selectedForNextRound: true,
          },
        },
      },
    });

    // Group submissions by userId and take the first one for each user
    const submissionMap = new Map<string, typeof submissions[0]>();
    for (const submission of submissions) {
      if (!submissionMap.has(submission.userId)) {
        submissionMap.set(submission.userId, submission);
      }
    }

    const items: CandidateListItem[] = candidates.map((candidate) => {
      const submission = submissionMap.get(candidate.id) || null;
      const session = candidate.collegeSessionId
        ? sessionMap.get(candidate.collegeSessionId) || null
        : null;
      return {
        id: candidate.id,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        isActive: candidate.isActive,
        collegeSessionId: candidate.collegeSessionId,
        session: session
          ? {
              id: session.id,
              name: session.name,
              status: session.status,
            }
          : null,
        submission: submission
          ? {
              id: submission.id,
              submittedAt: submission.submittedAt,
              exam: submission.exam,
            }
          : null,
        finalResult: submission?.finalResult
          ? {
              totalMarks: submission.finalResult.totalMarks,
              rank: submission.finalResult.rank,
              selectedForNextRound: submission.finalResult.selectedForNextRound,
            }
          : null,
      };
    });

    return {
      items,
      total: totalCandidates,
    };
  }

  async findAllCandidatesForExport(
    dto: Omit<ListCandidatesDto, 'page' | 'limit'>,
  ): Promise<CandidateListItem[]> {
    const candidateWhere = {
      role: 'candidate' as const,
      deletedAt: null,
    };

    const submissionWhere: any = {};
    if (dto.examId) {
      submissionWhere.examId = dto.examId;
    }
    if (dto.collegeSessionId) {
      submissionWhere.exam = {
        collegeSessionId: dto.collegeSessionId,
      };
    }
    if (dto.selectedForNextRound !== undefined) {
      submissionWhere.finalResult = {
        selectedForNextRound: dto.selectedForNextRound,
      };
    }

    if (dto.examId || dto.collegeSessionId || dto.selectedForNextRound !== undefined) {
      // Get candidate IDs that have submissions matching filters
      const candidateIdsWithSubmissions = await this.prisma.submission.findMany({
        where: submissionWhere,
        distinct: ['userId'],
        select: { userId: true },
      });

      const userIds = candidateIdsWithSubmissions.map((s) => s.userId);

      const candidates = await this.prisma.user.findMany({
        where: {
          ...candidateWhere,
          id: { in: userIds },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          collegeSessionId: true,
        },
      });

      // Fetch sessions for these candidates
      const sessionIds = candidates
        .map((c) => c.collegeSessionId)
        .filter((id): id is string => id !== null);
      const sessions = sessionIds.length > 0
        ? await this.prisma.recruitmentSession.findMany({
            where: {
              id: { in: sessionIds },
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
          })
        : [];
      const sessionMap = new Map(sessions.map((s) => [s.id, s]));

      // Fetch submissions for these candidates
      const candidateIds = candidates.map((c) => c.id);
      const submissions = await this.prisma.submission.findMany({
        where: {
          userId: { in: candidateIds },
          ...submissionWhere,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          submittedAt: true,
          exam: {
            select: {
              id: true,
              title: true,
            },
          },
          finalResult: {
            select: {
              totalMarks: true,
              rank: true,
              selectedForNextRound: true,
            },
          },
        },
      });

      // Group submissions by userId and take the first one for each user
      const submissionMap = new Map<string, typeof submissions[0]>();
      for (const submission of submissions) {
        if (!submissionMap.has(submission.userId)) {
          submissionMap.set(submission.userId, submission);
        }
      }

      return candidates.map((candidate) => {
        const submission = submissionMap.get(candidate.id) || null;
        const session = candidate.collegeSessionId
          ? sessionMap.get(candidate.collegeSessionId) || null
          : null;
        return {
          id: candidate.id,
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          isActive: candidate.isActive,
          collegeSessionId: candidate.collegeSessionId,
          session: session
            ? {
                id: session.id,
                name: session.name,
                status: session.status,
              }
            : null,
          submission: submission
            ? {
                id: submission.id,
                submittedAt: submission.submittedAt,
                exam: submission.exam,
              }
            : null,
          finalResult: submission?.finalResult
            ? {
                totalMarks: submission.finalResult.totalMarks,
                rank: submission.finalResult.rank,
                selectedForNextRound: submission.finalResult.selectedForNextRound,
              }
            : null,
        };
      });
    }

    // No filters - get all candidates
    const candidates = await this.prisma.user.findMany({
      where: candidateWhere,
      orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          collegeSessionId: true,
        },
      });

    // Fetch sessions for all candidates
    const sessionIds = candidates
      .map((c) => c.collegeSessionId)
      .filter((id): id is string => id !== null);
    const sessions = sessionIds.length > 0
      ? await this.prisma.recruitmentSession.findMany({
          where: {
            id: { in: sessionIds },
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            status: true,
          },
        })
      : [];
    const sessionMap = new Map(sessions.map((s) => [s.id, s]));

    // Fetch submissions for all candidates
    const candidateIds = candidates.map((c) => c.id);
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId: { in: candidateIds },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        submittedAt: true,
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
        finalResult: {
          select: {
            totalMarks: true,
            rank: true,
            selectedForNextRound: true,
          },
        },
      },
    });

    // Group submissions by userId and take the first one for each user
    const submissionMap = new Map<string, typeof submissions[0]>();
    for (const submission of submissions) {
      if (!submissionMap.has(submission.userId)) {
        submissionMap.set(submission.userId, submission);
      }
    }

    return candidates.map((candidate) => {
      const submission = submissionMap.get(candidate.id) || null;
      const session = candidate.collegeSessionId
        ? sessionMap.get(candidate.collegeSessionId) || null
        : null;
      return {
        id: candidate.id,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        isActive: candidate.isActive,
        collegeSessionId: candidate.collegeSessionId,
        session: session
          ? {
              id: session.id,
              name: session.name,
              status: session.status,
            }
          : null,
        submission: submission
          ? {
              id: submission.id,
              submittedAt: submission.submittedAt,
              exam: submission.exam,
            }
          : null,
        finalResult: submission?.finalResult
          ? {
              totalMarks: submission.finalResult.totalMarks,
              rank: submission.finalResult.rank,
              selectedForNextRound: submission.finalResult.selectedForNextRound,
            }
          : null,
      };
    });
  }
}
