import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { parseCandidateCsv } from './utils/csv-parser.util';
import { generateErrorCsv, FailedCandidateRow } from './utils/error-csv.util';
import { saveErrorCsv } from './utils/file-storage.util';
import { chunkArray } from './utils/batch.util';

@Injectable()
export class BulkUploadService {
  private readonly logger = new Logger(BulkUploadService.name);
  private readonly BATCH_SIZE = 500;

  constructor(private readonly prisma: PrismaService) {}

  async uploadCandidates(
    buffer: Buffer,
    collegeSessionId: string,
    uploadedBy: string,
  ) {
    if (!(buffer instanceof Buffer)) {
      this.logger.error(
        `Invalid CSV file buffer provided: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}`,
      );
      throw new BadRequestException('Invalid CSV file buffer');
    }

    let rows: ReturnType<typeof parseCandidateCsv>;
    try {
      rows = parseCandidateCsv(buffer);
    } catch (error) {
      this.logger.error(
        `CSV parsing failed: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to parse CSV file');
    }

    if (!rows.length) {
      this.logger.warn(
        `Empty CSV file provided: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}`,
      );
      throw new BadRequestException('CSV file is empty');
    }

    this.logger.log(
      `Bulk upload started: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}, totalRows=${rows.length}`,
    );

    const valid: typeof rows = [];
    const failed: FailedCandidateRow[] = [];

    for (const row of rows) {
      if (!row.email || !row.firstName || !row.lastName) {
        failed.push({
          ...row,
          reason: 'Missing required fields',
        });
        continue;
      }
      valid.push(row);
    }

    const batches = chunkArray(valid, this.BATCH_SIZE);
    let insertedCount = 0;

    try {
      for (const batch of batches) {
        const result = await this.prisma.user.createMany({
          data: batch.map((row) => ({
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            role: UserRole.candidate,
            collegeSessionId,
            passwordHash: null,
          })),
          skipDuplicates: true,
        });

        insertedCount += result.count;
      }
    } catch (error) {
      this.logger.error(
        `Database error during bulk insert: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        'Failed to insert candidates into database',
      );
    }

    if (valid.length > insertedCount) {
      valid
        .slice(insertedCount)
        .forEach((row) => failed.push({ ...row, reason: 'Duplicate email' }));
    }

    let errorCsvUrl: string | null = null;

    if (failed.length) {
      try {
        const csvBuffer = generateErrorCsv(failed);
        errorCsvUrl = await saveErrorCsv(csvBuffer);
      } catch (error) {
        this.logger.error(
          `Failed to save error CSV: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        // Continue without error CSV - don't fail the entire operation
      }
    }

    try {
      await this.prisma.bulkUpload.create({
        data: {
          fileUrl: 'uploaded',
          errorCsvUrl,
          totalRows: rows.length,
          successCount: insertedCount,
          failedCount: failed.length,
          collegeSessionId,
          uploadedBy,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create bulk upload record: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        'Failed to record bulk upload operation',
      );
    }

    this.logger.log(
      `Bulk upload completed: collegeSessionId=${collegeSessionId}, uploadedBy=${uploadedBy}, total=${rows.length}, success=${insertedCount}, failed=${failed.length}`,
    );

    return {
      total: rows.length,
      successCount: insertedCount,
      failedCount: failed.length,
      errorCsvUrl,
    };
  }
}
