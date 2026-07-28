import { Module } from '@nestjs/common';
import { AiGenerationService } from './services/ai-generation.service';
import { ResumeParsingService } from './services/resume-parsing.service';
import { AiQuestionsController } from './controllers/ai-questions.controller';

/**
 * AI Module
 * Handles AI-powered question generation and related functionality
 */
@Module({
  imports: [],
  controllers: [AiQuestionsController],
  providers: [AiGenerationService, ResumeParsingService],
  exports: [AiGenerationService, ResumeParsingService],
})
export class AiModule {}
