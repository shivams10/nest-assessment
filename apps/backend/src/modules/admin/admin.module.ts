import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ScoringModule } from '../scoring/scoring.module';
import { AdminCandidatesController } from './controllers/admin-candidates.controller';
import { AdminCandidatesService } from './services/admin-candidates.service';
import { AdminCandidatesRepository } from './repositories/admin-candidates.repository';

@Module({
  imports: [ScoringModule],
  controllers: [AdminController, AdminCandidatesController],
  providers: [AdminService, AdminCandidatesService, AdminCandidatesRepository],
})
export class AdminModule {}
