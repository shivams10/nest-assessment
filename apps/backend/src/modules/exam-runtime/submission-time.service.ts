import { Injectable, ForbiddenException } from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';

@Injectable()
export class SubmissionTimeService {
  constructor(private readonly submissionRepo: SubmissionRepository) {}

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
      await this.submissionRepo.autoSubmit(submissionId);
      throw new ForbiddenException('Exam auto-submitted');
    }

    return submission;
  }
}
