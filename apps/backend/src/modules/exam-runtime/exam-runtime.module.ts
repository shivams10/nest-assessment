import { Module } from '@nestjs/common';

import { ExamRuntimeController } from './exam-runtime.controller';
import { ExamRuntimeService } from './exam-runtime.service';
import { ExamRuntimeRepository } from './exam-runtime.repository';
import { ExamAnswerService } from './exam-answer.service';
import { ExamAnswerRepository } from './exam-answer.repository';
import { ExamAnswerController } from './exam-answer.controller';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { SubmissionTimeService } from './submission-time.service';
import { AutoSubmitService } from './auto-submit.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScoringModule],
  controllers: [
    ExamRuntimeController,
    ExamAnswerController,
    SubmissionController,
  ],
  providers: [
    ExamRuntimeService,
    ExamRuntimeRepository,
    ExamAnswerService,
    ExamAnswerRepository,
    SubmissionService,
    SubmissionRepository,
    SubmissionTimeService,
    AutoSubmitService,
  ],
  exports: [AutoSubmitService],
})
export class ExamRuntimeModule {}
