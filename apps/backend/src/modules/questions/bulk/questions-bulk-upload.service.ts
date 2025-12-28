import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { QuestionCategory, QuestionType } from '@prisma/client';
import { parseQuestionCsv } from './utils/question-csv-parser.util';
import {
  generateQuestionErrorCsv,
  FailedQuestionRow,
} from './utils/question-error-csv.util';
import { saveErrorCsv } from '../../candidates/bulk/utils/file-storage.util';
import { chunkArray } from '../../candidates/bulk/utils/batch.util';

@Injectable()
export class QuestionsBulkUploadService {
  private readonly logger = new Logger(QuestionsBulkUploadService.name);
  private readonly BATCH_SIZE = 500;

  constructor(private readonly prisma: PrismaService) {}

  async uploadQuestions(
    buffer: Buffer,
    uploadedBy: string,
  ): Promise<{ uploadId: string }> {
    if (!(buffer instanceof Buffer)) {
      this.logger.error(
        `Invalid CSV file buffer provided: uploadedBy=${uploadedBy}`,
      );
      throw new BadRequestException('Invalid CSV file buffer');
    }

    let rows: ReturnType<typeof parseQuestionCsv>;
    try {
      rows = parseQuestionCsv(buffer);
    } catch (error) {
      this.logger.error(
        `CSV parsing failed: uploadedBy=${uploadedBy}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to parse CSV file');
    }

    if (!rows.length) {
      this.logger.warn(
        `Empty CSV file provided: uploadedBy=${uploadedBy}`,
      );
      throw new BadRequestException('CSV file is empty');
    }

    this.logger.log(
      `Bulk question upload started: uploadedBy=${uploadedBy}, totalRows=${rows.length}`,
    );

    // Create bulk upload record
    // Use a dummy session ID since BulkUpload model requires it
    // In a real system, we might want to make collegeSessionId nullable
    const dummySession = await this.prisma.recruitmentSession.findFirst({
      where: { deletedAt: null },
    });

    if (!dummySession) {
      throw new BadRequestException(
        'No recruitment session found. Please create a session first.',
      );
    }

    const bulkUpload = await this.prisma.bulkUpload.create({
      data: {
        fileUrl: 'questions-upload', // Placeholder
        totalRows: rows.length,
        successCount: 0,
        failedCount: 0,
        uploadedBy,
        collegeSessionId: dummySession.id, // Required by model
      },
    });

    // Process rows asynchronously (fire and forget for now)
    this.processQuestionsAsync(bulkUpload.id, rows, uploadedBy).catch(
      (error) => {
        this.logger.error(
          `Async question processing failed: uploadId=${bulkUpload.id}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      },
    );

    return { uploadId: bulkUpload.id };
  }

  private async processQuestionsAsync(
    uploadId: string,
    rows: ReturnType<typeof parseQuestionCsv>,
    uploadedBy: string,
  ) {
    const valid: Array<{
      stem: string;
      type: QuestionType;
      category: QuestionCategory;
      options: Array<{ optionText: string; isCorrect: boolean }>;
    }> = [];
    const failed: FailedQuestionRow[] = [];

    // Validate and parse rows
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV has header and 0-indexed

      // Validate required fields
      if (!row.stem || row.stem.trim() === '') {
        failed.push({
          rowNumber,
          ...row,
          reason: 'Question stem is required',
        });
        return;
      }

      // Validate type
      if (row.type !== 'single_select' && row.type !== 'multi_select') {
        failed.push({
          rowNumber,
          ...row,
          reason: 'Type must be single_select or multi_select',
        });
        return;
      }

      // Validate category
      if (row.category !== 'aptitude' && row.category !== 'technical') {
        failed.push({
          rowNumber,
          ...row,
          reason: 'Category must be aptitude or technical',
        });
        return;
      }

      // Parse options
      const options = [
        row.option1,
        row.option2,
        row.option3,
        row.option4,
      ].filter((opt) => opt && opt.trim() !== '');

      if (options.length < 2) {
        failed.push({
          rowNumber,
          ...row,
          reason: 'At least 2 options are required',
        });
        return;
      }

      // Parse correct options
      const correctIndices = row.correctOptions
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= options.length);

      if (correctIndices.length === 0) {
        failed.push({
          rowNumber,
          ...row,
          reason: 'At least one correct option must be specified',
        });
        return;
      }

      // Validate correct options count
      if (row.type === 'single_select' && correctIndices.length !== 1) {
        failed.push({
          rowNumber,
          ...row,
          reason: 'Single select questions must have exactly one correct option',
        });
        return;
      }

      // Build options array
      const optionsArray = options.map((opt, idx) => ({
        optionText: opt,
        isCorrect: correctIndices.includes(idx + 1),
      }));

      valid.push({
        stem: row.stem.trim(),
        type: row.type,
        category: row.category,
        options: optionsArray,
      });
    });

    // Insert valid questions in batches
    const batches = chunkArray(valid, this.BATCH_SIZE);
    let insertedCount = 0;

    try {
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (question) => {
            await this.prisma.question.create({
              data: {
                stem: question.stem,
                type: question.type,
                category: question.category,
                createdBy: uploadedBy,
                options: {
                  create: question.options,
                },
              },
            });
            insertedCount++;
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to insert questions batch: uploadId=${uploadId}, error=${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Continue processing - mark as failed
    }

    // Generate error CSV if there are failures
    let errorCsvUrl: string | null = null;
    if (failed.length > 0) {
      const errorCsv = generateQuestionErrorCsv(failed);
      errorCsvUrl = await saveErrorCsv(errorCsv);
    }

    // Update bulk upload record
    await this.prisma.bulkUpload.update({
      where: { id: uploadId },
      data: {
        successCount: insertedCount,
        failedCount: failed.length,
        errorCsvUrl,
      },
    });

    this.logger.log(
      `Bulk question upload completed: uploadId=${uploadId}, success=${insertedCount}, failed=${failed.length}`,
    );
  }

  async getUploadStatus(uploadId: string) {
    const upload = await this.prisma.bulkUpload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    return {
      id: upload.id,
      status:
        upload.successCount + upload.failedCount >= upload.totalRows
          ? 'completed'
          : 'processing',
      totalRows: upload.totalRows,
      processedRows: upload.successCount + upload.failedCount,
      successfulRows: upload.successCount,
      failedRows: upload.failedCount,
      errorFileUrl: upload.errorCsvUrl,
      createdAt: upload.createdAt,
      updatedAt: upload.createdAt, // Use createdAt as updatedAt for now
    };
  }
}

