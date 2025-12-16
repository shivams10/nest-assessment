import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamRepository } from './exam.repository';

@Injectable()
export class ExamService {
  constructor(private readonly examRepository: ExamRepository) {}

  /**
   * List published exams for a session
   */
  getPublishedExams(collegeSessionId: string) {
    return this.examRepository.findPublishedBySession(collegeSessionId);
  }

  /**
   * Publish an exam after validation
   */
  async publishExam(examId: string) {
    const exam = await this.examRepository.findById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.examRepository.publish(examId);
  }
}
