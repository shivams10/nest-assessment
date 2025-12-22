import { Module } from '@nestjs/common';
import { ExamAttemptsController } from './exam-attempts.controller';
import { ExamAttemptsService } from './exam-attempts.service';
import { ExamAttemptsRepository } from './exam-attempts.repository';

@Module({
  controllers: [ExamAttemptsController],
  providers: [ExamAttemptsService, ExamAttemptsRepository],
})
export class ExamAttemptsModule {}
