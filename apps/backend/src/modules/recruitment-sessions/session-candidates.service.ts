import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserRole, SessionStatus } from '@prisma/client';
import {
  parseCandidateCsv,
  type ParsedCandidateRow,
} from '../candidates/bulk/utils/csv-parser.util';
import {
  generateErrorCsv,
  type FailedCandidateRow,
} from '../candidates/bulk/utils/error-csv.util';
import { saveErrorCsv } from '../candidates/bulk/utils/file-storage.util';
// Simple chunk array utility
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

@Injectable()
export class SessionCandidatesService {
  private readonly logger = new Logger(SessionCandidatesService.name);
  private readonly BATCH_SIZE = 500;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate session status based on current date and session dates
   * This ensures we use the actual current status, not the stored (potentially stale) status
   */
  private calculateSessionStatus(
    startDate: Date | null,
    endDate: Date | null,
    storedStatus: SessionStatus,
  ): SessionStatus {
    if (!startDate || !endDate) {
      return storedStatus; // Cannot calculate without both dates, use stored status
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) {
      return SessionStatus.active;
    } else if (now > end) {
      return SessionStatus.completed;
    } else {
      return SessionStatus.upcoming;
    }
  }

  /**
   * Bulk assign candidates to a session via CSV upload
   */
  async bulkAssignFromCsv(
    buffer: Buffer,
    sessionId: string,
    uploadedBy: string,
  ) {
    if (!(buffer instanceof Buffer)) {
      throw new BadRequestException('Invalid CSV file buffer');
    }

    // Validate session exists and is not completed
    const session = await this.prisma.recruitmentSession.findFirst({
      where: {
        id: sessionId,
        deletedAt: null,
      },
    });

    if (!session) {
      throw new NotFoundException('Recruitment session not found');
    }

    // Calculate actual status based on dates (not stored status which might be stale)
    const actualStatus = this.calculateSessionStatus(
      session.startDate,
      session.endDate,
      session.status,
    );

    if (actualStatus === SessionStatus.completed) {
      throw new BadRequestException(
        'Cannot assign candidates to a completed session',
      );
    }

    let rows: ParsedCandidateRow[];
    try {
      rows = parseCandidateCsv(buffer);
    } catch (error) {
      this.logger.error(
        `CSV parsing failed: sessionId=${sessionId}, uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to parse CSV file');
    }

    if (!rows.length) {
      throw new BadRequestException('CSV file is empty');
    }

    this.logger.log(
      `Bulk assign started: sessionId=${sessionId}, uploadedBy=${uploadedBy}, totalRows=${rows.length}`,
    );

    const valid: ParsedCandidateRow[] = [];
    const failed: FailedCandidateRow[] = [];

    // Validate rows
    for (const row of rows) {
      const missingFields: string[] = [];
      if (!row.email || row.email.trim() === '') missingFields.push('email');
      if (!row.firstName || row.firstName.trim() === '')
        missingFields.push('firstName');
      if (!row.lastName || row.lastName.trim() === '')
        missingFields.push('lastName');

      if (missingFields.length > 0) {
        failed.push({
          ...row,
          reason: `Missing required fields: ${missingFields.join(', ')}`,
        });
        continue;
      }
      valid.push(row);
    }

    let assignedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    const validationFailureCount = failed.length; // Count validation failures separately

    // Process in batches
    const batches = chunkArray(valid, this.BATCH_SIZE);

    for (const batch of batches) {
      await this.prisma.$transaction(async (tx) => {
        for (const row of batch) {
          try {
            // Check if user exists
            const existingUser = await tx.user.findUnique({
              where: { email: row.email },
            });

            if (existingUser) {
              // User exists - update if they're a candidate
              if (existingUser.role !== UserRole.candidate) {
                failed.push({
                  ...row,
                  reason: 'User exists but is not a candidate',
                });
                skippedCount++;
                continue;
              }

              // Update existing candidate
              await tx.user.update({
                where: { id: existingUser.id },
                data: { collegeSessionId: sessionId },
              });
              assignedCount++;
            } else {
              // Create new candidate
              await tx.user.create({
                data: {
                  email: row.email,
                  firstName: row.firstName,
                  lastName: row.lastName,
                  role: UserRole.candidate,
                  collegeSessionId: sessionId,
                  passwordHash: null,
                },
              });
              createdCount++;
            }
          } catch (error) {
            this.logger.warn(
              `Failed to process candidate: email=${row.email}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            failed.push({
              ...row,
              reason: error instanceof Error ? error.message : 'Unknown error',
            });
            skippedCount++;
          }
        }
      });
    }

    let errorCsvUrl: string | undefined = undefined;

    if (failed.length > 0) {
      try {
        const csvBuffer = generateErrorCsv(failed);
        errorCsvUrl = await saveErrorCsv(csvBuffer);
      } catch (error) {
        this.logger.error(
          `Failed to save error CSV: sessionId=${sessionId}, uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        // Continue without error CSV
      }
    }

    const totalSkipped = validationFailureCount + skippedCount;

    this.logger.log(
      `Bulk assign completed: sessionId=${sessionId}, uploadedBy=${uploadedBy}, total=${rows.length}, assigned=${assignedCount}, created=${createdCount}, skipped=${totalSkipped}`,
    );

    return {
      total: rows.length,
      assigned: assignedCount,
      created: createdCount,
      skipped: totalSkipped,
      ...(errorCsvUrl && { errors: errorCsvUrl }),
    };
  }

  /**
   * Manually assign a candidate to a session
   */
  async assignCandidateToSession(sessionId: string, candidateId: string) {
    // Validate session exists and is not completed
    const session = await this.prisma.recruitmentSession.findFirst({
      where: {
        id: sessionId,
        deletedAt: null,
      },
    });

    if (!session) {
      throw new NotFoundException('Recruitment session not found');
    }

    // Calculate actual status based on dates (not stored status which might be stale)
    const actualStatus = this.calculateSessionStatus(
      session.startDate,
      session.endDate,
      session.status,
    );

    if (actualStatus === SessionStatus.completed) {
      throw new BadRequestException(
        'Cannot assign candidates to a completed session',
      );
    }

    // Validate candidate exists and is a candidate
    const candidate = await this.prisma.user.findFirst({
      where: {
        id: candidateId,
        role: UserRole.candidate,
        deletedAt: null,
      },
    });

    if (!candidate) {
      throw new NotFoundException(
        'Candidate not found or is not a candidate user',
      );
    }

    // Update candidate's session assignment
    const updated = await this.prisma.user.update({
      where: { id: candidateId },
      data: { collegeSessionId: sessionId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        collegeSessionId: true,
        isActive: true,
        role: true,
      },
    });

    this.logger.log(
      `Candidate assigned to session: candidateId=${candidateId}, sessionId=${sessionId}`,
    );

    return updated;
  }

  /**
   * Get paginated list of candidates for a session
   */
  async getSessionCandidates(
    sessionId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Validate session exists
    const session = await this.prisma.recruitmentSession.findFirst({
      where: {
        id: sessionId,
        deletedAt: null,
      },
    });

    if (!session) {
      throw new NotFoundException('Recruitment session not found');
    }

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 per page

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          role: UserRole.candidate,
          collegeSessionId: sessionId,
          deletedAt: null,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          collegeSessionId: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.candidate,
          collegeSessionId: sessionId,
          deletedAt: null,
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get unassigned candidates (collegeSessionId is null)
   */
  async getUnassignedCandidates(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 per page

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          role: UserRole.candidate,
          collegeSessionId: null,
          deletedAt: null,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          collegeSessionId: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.candidate,
          collegeSessionId: null,
          deletedAt: null,
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
