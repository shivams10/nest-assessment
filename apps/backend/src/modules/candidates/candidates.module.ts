import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { BulkUploadController } from './bulk/bulk-upload.controller';
import { BulkUploadService } from './bulk/bulk-upload.service';

@Module({
  controllers: [CandidatesController, BulkUploadController],
  providers: [CandidatesService, BulkUploadService],
})
export class CandidatesModule {}
