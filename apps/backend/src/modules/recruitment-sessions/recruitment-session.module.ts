import { Module } from '@nestjs/common';
import { RecruitmentSessionController } from './recruitment-session.controller';
import { RecruitmentSessionService } from './recruitment-session.service';
import { RecruitmentSessionRepository } from './recruitment-session.repository';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecruitmentSessionController],
  providers: [RecruitmentSessionService, RecruitmentSessionRepository],
  exports: [RecruitmentSessionService, RecruitmentSessionRepository],
})
export class RecruitmentSessionModule {}
