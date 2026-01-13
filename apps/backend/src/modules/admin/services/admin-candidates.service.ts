import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { AdminCandidatesRepository, CandidateListItem } from '../repositories/admin-candidates.repository';
import { ListCandidatesDto } from '../dto/list-candidates.dto';
import { AssignCandidateSessionDto, BulkAssignCandidatesDto } from '../dto/assign-candidate-session.dto';
import { stringify } from 'csv-stringify/sync';
import { USER_PUBLIC_SELECT } from '../constants/user-public.select';

@Injectable()
export class AdminCandidatesService {
  private readonly logger = new Logger(AdminCandidatesService.name);

  constructor(
    private readonly repository: AdminCandidatesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async listCandidates(dto: ListCandidatesDto) {
    const { items, total } = await this.repository.listCandidates(dto);

    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);

    return {
      items,
      total,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async activateCandidate(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Candidate not found');
    }

    if (user.role !== 'candidate') {
      throw new BadRequestException('Only candidates can be activated/deactivated');
    }

    if (user.isActive) {
      throw new BadRequestException('Candidate is already active');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(
      `Candidate activated: userId=${userId}, email=${updated.email}`,
    );

    return updated;
  }

  async deactivateCandidate(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Candidate not found');
    }

    if (user.role !== 'candidate') {
      throw new BadRequestException('Only candidates can be activated/deactivated');
    }

    if (!user.isActive) {
      throw new BadRequestException('Candidate is already inactive');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(
      `Candidate deactivated: userId=${userId}, email=${updated.email}`,
    );

    return updated;
  }

  async exportCandidates(dto: Omit<ListCandidatesDto, 'page' | 'limit'>) {
    const candidates = await this.repository.findAllCandidatesForExport(dto);

    const csvRows = candidates.map((candidate) => ({
      email: candidate.email,
      name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'N/A',
      exam: candidate.submission?.exam.title || 'Not submitted',
      marks: candidate.finalResult?.totalMarks?.toFixed(2) || 'N/A',
      rank: candidate.finalResult?.rank?.toString() || 'N/A',
      selected: candidate.finalResult?.selectedForNextRound ? 'Yes' : 'No',
    }));

    const csv = stringify(csvRows, {
      header: true,
      columns: ['email', 'name', 'exam', 'marks', 'rank', 'selected'],
    });

    return csv;
  }

  async assignCandidateSession(userId: string, dto: AssignCandidateSessionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Candidate not found');
    }

    if (user.role !== 'candidate') {
      throw new BadRequestException('Only candidates can be assigned to sessions');
    }

    // If collegeSessionId is provided, validate session exists
    if (dto.collegeSessionId !== null && dto.collegeSessionId !== undefined) {
      const session = await this.prisma.recruitmentSession.findFirst({
        where: {
          id: dto.collegeSessionId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new NotFoundException('Recruitment session not found');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        collegeSessionId: dto.collegeSessionId ?? null,
      },
      select: USER_PUBLIC_SELECT,
    });

    this.logger.log(
      `Candidate session assigned: userId=${userId}, email=${updated.email}, sessionId=${dto.collegeSessionId ?? 'null'}`,
    );

    return updated;
  }

  async bulkAssignCandidates(dto: BulkAssignCandidatesDto) {
    if (!dto.userIds || dto.userIds.length === 0) {
      throw new BadRequestException('At least one user ID is required');
    }

    // If collegeSessionId is provided, validate session exists
    if (dto.collegeSessionId !== null && dto.collegeSessionId !== undefined) {
      const session = await this.prisma.recruitmentSession.findFirst({
        where: {
          id: dto.collegeSessionId,
          deletedAt: null,
        },
      });

      if (!session) {
        throw new NotFoundException('Recruitment session not found');
      }
    }

    let updated = 0;
    let skipped = 0;

    // Process in transaction
    await this.prisma.$transaction(async (tx) => {
      for (const userId of dto.userIds) {
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!user || user.role !== 'candidate') {
          skipped++;
          continue;
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            collegeSessionId: dto.collegeSessionId ?? null,
          },
        });

        updated++;
      }
    });

    this.logger.log(
      `Bulk assign candidates: updated=${updated}, skipped=${skipped}, sessionId=${dto.collegeSessionId ?? 'null'}`,
    );

    return {
      updated,
      skipped,
    };
  }
}

