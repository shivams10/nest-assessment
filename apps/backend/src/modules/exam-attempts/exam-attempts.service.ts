import { Injectable, BadRequestException } from '@nestjs/common';
import { ExamAttemptsRepository } from './exam-attempts.repository';
import { StartExamDto } from './dto/start-exam.dto';

@Injectable()
export class ExamAttemptsService {
  constructor(private readonly repo: ExamAttemptsRepository) {}

  async startExam(dto: StartExamDto, userId: string) {
    // 1. Prevent multiple attempts
    const existing = await this.repo.findExistingAttempt(dto.examId, userId);

    if (existing) {
      return existing; // idempotent
    }

    // 2. Fetch available exam sets
    const sets = await this.repo.findExamSets(dto.examId);

    if (!sets.length) {
      throw new BadRequestException('Exam has no configured sets');
    }

    // 3. Randomly select ONE set
    const randomIndex = Math.floor(Math.random() * sets.length);
    const selectedSet = sets[randomIndex];

    // 4. Create attempt (LOCKED)
    return this.repo.createAttempt(dto.examId, userId, selectedSet.id);
  }
}
