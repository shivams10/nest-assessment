import { Injectable, Logger } from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';
import { SubmissionService } from './submission.service';

@Injectable()
export class AutoSubmitService {
  private readonly logger = new Logger(AutoSubmitService.name);

  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly submissionService: SubmissionService,
  ) {}

  /**
   * Process expired submissions and auto-submit them
   * - Safe to run multiple times (idempotent)
   * - Can be called by a scheduler
   */
  async processExpiredSubmissions(): Promise<{
    processed: number;
    skipped: number;
    errors: number;
  }> {
    const now = new Date();
    const activeSubmissions =
      await this.submissionRepository.findExpiredActiveSubmissions();

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const submission of activeSubmissions) {
      const { windowStartsAt, durationSeconds } = submission.exam;

      if (!durationSeconds) {
        skipped++;
        continue;
      }

      // Calculate end time: use startedAt if available, otherwise windowStartsAt
      const startTime = submission.startedAt ?? windowStartsAt;

      if (!startTime) {
        skipped++;
        continue;
      }

      const examEndTime = new Date(
        startTime.getTime() + durationSeconds * 1000,
      );

      // Only process if time has expired
      if (now < examEndTime) {
        skipped++;
        continue;
      }

      try {
        // autoSubmit is idempotent - safe to call multiple times
        await this.submissionService.autoSubmit(submission.id);

        processed++;
        this.logger.log(`Auto-submitted expired submission ${submission.id}`);
      } catch (error) {
        errors++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `Failed to auto-submit submission ${submission.id}: ${errorMessage}`,
          errorStack,
        );
        // Continue processing other submissions - don't fail entire batch
      }
    }

    this.logger.log(
      `Auto-submit process completed: ${processed} processed, ${skipped} skipped, ${errors} errors`,
    );

    return { processed, skipped, errors };
  }
}
