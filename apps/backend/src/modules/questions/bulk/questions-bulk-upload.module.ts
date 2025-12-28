import { Module } from '@nestjs/common';
import { QuestionsBulkUploadController } from './questions-bulk-upload.controller';
import { QuestionsBulkUploadService } from './questions-bulk-upload.service';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionsBulkUploadController],
  providers: [QuestionsBulkUploadService],
})
export class QuestionsBulkUploadModule {}

