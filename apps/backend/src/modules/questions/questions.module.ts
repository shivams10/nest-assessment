import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsRepository } from './questions.repository';
import { QuestionsBulkUploadModule } from './bulk/questions-bulk-upload.module';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule, QuestionsBulkUploadModule],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository],
  exports: [QuestionsService],
})
export class QuestionsModule {}

