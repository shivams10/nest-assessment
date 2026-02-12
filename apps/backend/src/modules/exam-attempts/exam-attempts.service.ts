import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ExamAttemptsRepository } from './exam-attempts.repository';
import { StartExamDto } from './dto/start-exam.dto';

@Injectable()
export class ExamAttemptsService {
  constructor(private readonly repo: ExamAttemptsRepository) {}

  async startExam(
    dto: StartExamDto,
    userId: string,
  ): Promise<{
    id: string;
    examId: string;
    examSetId: string;
    startedAt: Date | null;
    submittedAt: Date | null;
    autoSubmitted: boolean;
    createdAt: Date;
  }> {
    // 1. Prevent multiple attempts
    const existing = await this.repo.findExistingAttempt(dto.examId, userId);

    if (existing) {
      return existing; // idempotent
    }

    // 2. Validate exam exists and is published
    const exam = await this.repo.findExamForValidation(dto.examId);

    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    if (!exam.isPublished) {
      throw new ForbiddenException('Exam is not published');
    }

    // 3. Validate exam window dates
    if (!exam.windowStartsAt || !exam.windowEndsAt) {
      throw new BadRequestException('Exam window dates are not configured');
    }

    const now = new Date();
    const windowStart = new Date(exam.windowStartsAt);
    const windowEnd = new Date(exam.windowEndsAt);

    if (now < windowStart) {
      throw new ForbiddenException(
        `Exam is not yet available. Window starts at ${windowStart.toISOString()}`,
      );
    }

    if (now > windowEnd) {
      throw new ForbiddenException(
        `Exam window has ended. Window ended at ${windowEnd.toISOString()}`,
      );
    }

    // 4. Fetch available exam sets
    const sets = await this.repo.findExamSets(dto.examId);

    if (!sets.length) {
      throw new BadRequestException('Exam has no configured sets');
    }

    // 5. Randomly select ONE set
    const randomIndex = Math.floor(Math.random() * sets.length);
    const selectedSet = sets[randomIndex];

    // 6. Create attempt (LOCKED)
    return this.repo.createAttempt(dto.examId, userId, selectedSet.id);
  }
}
