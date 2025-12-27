import { Injectable, ForbiddenException } from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';
import { SubmissionService } from './submission.service';

@Injectable()
export class SubmissionTimeService {
  constructor(
    private readonly submissionRepo: SubmissionRepository,
    private readonly submissionService: SubmissionService,
  ) {}

  async assertSubmissionActive(submissionId: string) {
    const submission =
      await this.submissionRepo.findActiveSubmission(submissionId);

    if (!submission) {
      throw new ForbiddenException('Submission already closed');
    }

    const { windowStartsAt, durationSeconds } = submission.exam;

    if (!windowStartsAt || !durationSeconds) {
      throw new ForbiddenException('Invalid exam timing');
    }

    const examEndTime = new Date(
      windowStartsAt.getTime() + durationSeconds * 1000,
    );

    if (new Date() >= examEndTime) {
      // Use SubmissionService to trigger scoring
      await this.submissionService.autoSubmit(submissionId);
      throw new ForbiddenException('Exam auto-submitted');
    }

    return submission;
  }
}
