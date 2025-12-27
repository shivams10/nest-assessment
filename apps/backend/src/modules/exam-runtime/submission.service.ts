import { Injectable, ForbiddenException } from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly scoringService: ScoringService,
  ) {}

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

    return {
      submissionId: updatedSubmission.id,
      submittedAt: updatedSubmission.submittedAt,
    };
  }
}
