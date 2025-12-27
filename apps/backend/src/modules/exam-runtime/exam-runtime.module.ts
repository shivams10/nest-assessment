import { Module } from '@nestjs/common';

import { ExamRuntimeController } from './exam-runtime.controller';
import { ExamRuntimeService } from './exam-runtime.service';
import { ExamRuntimeRepository } from './exam-runtime.repository';
import { ExamAnswerService } from './exam-answer.service';
import { ExamAnswerRepository } from './exam-answer.repository';
import { ExamAnswerController } from './exam-answer.controller';

@Module({
  controllers: [ExamRuntimeController, ExamAnswerController],
  providers: [
    ExamRuntimeService,
    ExamRuntimeRepository,
    ExamAnswerService,
    ExamAnswerRepository,
  ],
})
export class ExamRuntimeModule {}
