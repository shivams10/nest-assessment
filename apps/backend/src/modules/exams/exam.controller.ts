import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ExamService } from './exam.service';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  /**
   * GET /exams/session/:sessionId
   */
  @Get('session/:sessionId')
  getPublishedExams(@Param('sessionId') sessionId: string) {
    return this.examService.getPublishedExams(sessionId);
  }

  /**
   * PATCH /exams/:id/publish
   */
  @Patch(':id/publish')
  publishExam(@Param('id') id: string) {
    return this.examService.publishExam(id);
  }
}
