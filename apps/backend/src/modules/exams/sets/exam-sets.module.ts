import { Module } from '@nestjs/common';
import { ExamSetsController } from './exam-sets.controller';
import { ExamSetsService } from './exam-sets.service';
import { ExamSetsRepository } from './exam-sets.repository';
import { ExamSetQuestionsModule } from './exam-set-questions.module';

@Module({
  imports: [ExamSetQuestionsModule],
  controllers: [ExamSetsController],
  providers: [ExamSetsService, ExamSetsRepository],
})
export class ExamSetsModule {}
