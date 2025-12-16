import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { ExamRepository } from './exam.repository';

@Module({
  controllers: [ExamController],
  providers: [ExamService, ExamRepository],
  exports: [ExamService],
})
export class ExamModule {}
