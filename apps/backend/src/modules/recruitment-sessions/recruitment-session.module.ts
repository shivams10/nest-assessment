import { Module } from '@nestjs/common';
import { RecruitmentSessionController } from './recruitment-session.controller';
import { RecruitmentSessionService } from './recruitment-session.service';
import { RecruitmentSessionRepository } from './recruitment-session.repository';
import { SessionCandidatesController, UnassignedCandidatesController } from './session-candidates.controller';
import { SessionCandidatesService } from './session-candidates.service';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    RecruitmentSessionController,
    SessionCandidatesController,
    UnassignedCandidatesController,
  ],
  providers: [
    RecruitmentSessionService,
    RecruitmentSessionRepository,
    SessionCandidatesService,
  ],
  exports: [
    RecruitmentSessionService,
    RecruitmentSessionRepository,
    SessionCandidatesService,
  ],
})
export class RecruitmentSessionModule {}
