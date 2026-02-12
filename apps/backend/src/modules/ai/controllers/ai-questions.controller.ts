import {
  Body,
  Controller,
  Post,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';
import { AiGenerationService } from '../services/ai-generation.service';
import { GenerateQuestionsRequestDto } from '../dto/generate-questions-request.dto';
import { GeneratedQuestionDto } from '../dto/generate-questions.dto';
import {
  CommitQuestionsDto,
  CommitQuestionsResponseDto,
} from '../dto/commit-questions.dto';
import {
  ValidationError,
  BudgetExceededError,
  PromptBuildError,
  AiResponseParseError,
} from '../errors/ai-errors';

export class PreviewQuestionsResponseDto {
  generated!: GeneratedQuestionDto[];
}

@Controller('api/ai/questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AiQuestionsController {
  private readonly logger = new Logger(AiQuestionsController.name);

  constructor(private readonly aiGenerationService: AiGenerationService) {}

  @Post('preview')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async preview(
    @Body() dto: GenerateQuestionsRequestDto,
  ): Promise<PreviewQuestionsResponseDto> {
    try {
      const generated =
        await this.aiGenerationService.generateQuestionsWithAI(dto);

      return { generated };
    } catch (error) {
      // Map custom errors to HTTP status codes
      if (error instanceof ValidationError) {
        this.logger.warn(`Validation error: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      if (error instanceof BudgetExceededError) {
        this.logger.warn(`Budget exceeded: ${error.message}`);
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
      }

      if (
        error instanceof PromptBuildError ||
        error instanceof AiResponseParseError
      ) {
        this.logger.error(`AI error: ${error.message}`, error.stack);
        throw new InternalServerErrorException(
          'Failed to generate questions. Please try again later.',
        );
      }

      // Unknown errors
      this.logger.error(
        `Unexpected error in preview endpoint: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again later.',
      );
    }
  }

  @Post('commit')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async commit(
    @Body() dto: CommitQuestionsDto,
    @GetUser('sub') userId: string | undefined,
  ): Promise<CommitQuestionsResponseDto> {
    try {
      // Get user ID or throw error if not authenticated
      if (!userId) {
        throw new BadRequestException(
          'User authentication required to commit questions',
        );
      }

      const insertedCount =
        await this.aiGenerationService.commitApprovedQuestions(
          dto.approved,
          userId,
        );

      return { insertedCount };
    } catch (error) {
      // Map ValidationError to 400
      if (error instanceof ValidationError) {
        this.logger.warn(`Validation error in commit: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      // Map Prisma/database errors to 500
      if (error instanceof Error && error.message.includes('Database error')) {
        this.logger.error(
          `Database error in commit: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          'Failed to save questions. Please try again later.',
        );
      }

      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Unknown errors
      this.logger.error(
        `Unexpected error in commit endpoint: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again later.',
      );
    }
  }
}
