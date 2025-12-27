import { Module } from '@nestjs/common';

import { ExamsController } from './exam.controller';
import { ExamService } from './exam.service';
import { ExamRepository } from './exam.repository';
import { ExamSetsModule } from './sets/exam-sets.module';

@Module({
  imports: [ExamSetsModule],
  controllers: [ExamsController],
  providers: [ExamService, ExamRepository],
  exports: [ExamService],
})
export class ExamsModule {}
