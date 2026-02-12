import { Module } from '@nestjs/common';
import { AiGenerationService } from './services/ai-generation.service';
import { AiQuestionsController } from './controllers/ai-questions.controller';

/**
 * AI Module
 * Handles AI-powered question generation and related functionality
 */
@Module({
  imports: [],
  controllers: [AiQuestionsController],
  providers: [AiGenerationService],
  exports: [AiGenerationService],
})
export class AiModule {}
