import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly scoringService: ScoringService,
  ) {}

  /**
   * Manually submit an exam (candidate action)
   * - Validates submission ownership
   * - Uses submittedAt as guard (only active submissions)
   * - Triggers scoring (idempotent via ScoringService)
   */
  async submitManually(submissionId: string, userId: string) {
    const submission =
      await this.submissionRepository.findActiveSubmission(submissionId);

    if (!submission) {
      throw new ForbiddenException('Submission already closed');
    }

    if (submission.userId !== userId) {
      throw new ForbiddenException('Not allowed to submit this exam');
    }

    const updatedSubmission = await this.submissionRepository.markSubmitted(
      submissionId,
      false, // autoSubmitted = false
    );

    await this.scoringService.scoreSubmission({
      submissionId: updatedSubmission.id,
    });

    this.logger.log(
      `Exam manually submitted: submissionId=${submissionId}, userId=${userId}`,
    );

    return {
      submissionId: updatedSubmission.id,
      submittedAt: updatedSubmission.submittedAt,
    };
  }

  /**
   * Auto-submit an exam (system action)
   * - Validates submission ownership (optional userId for system calls)
   * - Uses submittedAt as guard (only active submissions)
   * - Triggers scoring (idempotent via ScoringService)
   */
  async autoSubmit(submissionId: string, userId?: string) {
    const submission =
      await this.submissionRepository.findActiveSubmission(submissionId);

    if (!submission) {
      // Already submitted - scoring will be idempotent if called
      return;
    }

    // Validate ownership if userId provided
    if (userId && submission.userId !== userId) {
      throw new ForbiddenException('Not allowed to submit this exam');
    }

    await this.submissionRepository.autoSubmit(submissionId);

    await this.scoringService.scoreSubmission({
      submissionId,
    });

    this.logger.log(
      `Exam auto-submitted: submissionId=${submissionId}, userId=${submission.userId}`,
    );
  }

  /**
   * Get exam result for a candidate
   * - Validates submission ownership
   * - Only returns public result fields
   */
  async getResult(submissionId: string, userId: string) {
    const submission =
      await this.submissionRepository.findSubmissionByIdAndUserId(
        submissionId,
        userId,
      );

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const { submittedAt } = submission;

    if (!submittedAt) {
      throw new ForbiddenException('Submission not yet completed');
    }

    const result =
      await this.scoringService.getFinalResultForSubmission(submissionId);

    if (!result) {
      throw new NotFoundException('Result not available');
    }

    return {
      totalMarks: result.totalMarks,
      aptitudeMarks: result.aptitudeMarks,
      technicalMarks: result.technicalMarks,
      selectedForNextRound: result.selectedForNextRound,
    };
  }
}
