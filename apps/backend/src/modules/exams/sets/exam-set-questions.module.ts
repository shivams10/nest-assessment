import { Module } from '@nestjs/common';
import { ExamSetQuestionsController } from './exam-set-questions.controller';
import { ExamSetQuestionsService } from './exam-set-questions.service';
import { ExamSetQuestionsRepository } from './exam-set-questions.repository';

@Module({
  controllers: [ExamSetQuestionsController],
  providers: [ExamSetQuestionsService, ExamSetQuestionsRepository],
})
export class ExamSetQuestionsModule {}
