import { Module } from '@nestjs/common';
import { InterviewCandidatesController } from './interview-candidates.controller';
import { InterviewCandidatesService } from './interview-candidates.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [InterviewCandidatesController],
  providers: [InterviewCandidatesService],
})
export class InterviewCandidatesModule {}
