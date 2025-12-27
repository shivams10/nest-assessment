import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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
      throw new BadRequestException('Invalid CSV file buffer');
    }

    const rows = parseCandidateCsv(buffer);

    if (!rows.length) {
      throw new BadRequestException('CSV is empty');
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

    if (valid.length > insertedCount) {
      valid
        .slice(insertedCount)
        .forEach((row) => failed.push({ ...row, reason: 'Duplicate email' }));
    }

    let errorCsvUrl: string | null = null;

    if (failed.length) {
      const csvBuffer = generateErrorCsv(failed);
      errorCsvUrl = await saveErrorCsv(csvBuffer);
    }

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
