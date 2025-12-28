import { Module } from '@nestjs/common';

import { ExamsController } from './exam.controller';
import { AdminExamController } from './admin-exam.controller';
import { ExamService } from './exam.service';
import { ExamRepository } from './exam.repository';
import { ExamSetsModule } from './sets/exam-sets.module';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [ExamSetsModule, PrismaModule],
  controllers: [ExamsController, AdminExamController],
  providers: [ExamService, ExamRepository],
  exports: [ExamService],
})
export class ExamsModule {}
