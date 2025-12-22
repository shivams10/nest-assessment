import { Injectable, ForbiddenException } from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';

@Injectable()
export class SubmissionService {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  /**
   * Manual submission by candidate
   * - Validates ownership
   * - Prevents double submission
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

    return this.submissionRepository.autoSubmit(submissionId);
  }
}
