import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@config/config.service';
import { PrismaService } from '@prisma/prisma.service';
import {
  GenerateQuestionsRequestDto,
  GeneratedQuestionDto,
} from '../dto/generate-questions.dto';
import { validateGeneratedQuestion } from '../dto/validate-generated-question.util';
import { buildQuestionGenerationPrompt } from '../prompt/prompt-builder';
import {
  PromptBuildError,
  AiResponseParseError,
  ValidationError,
  BudgetExceededError,
} from '../errors/ai-errors';
import { Prisma } from '@prisma/client';

/**
 * Constants for cost guardrails
 */
const MAX_QUESTIONS_PER_REQUEST = 20;
const MAX_TOKENS_PER_REQUEST = 4000;
const DEFAULT_TEMPERATURE = 0.4;

@Injectable()
export class AiGenerationService {
  private readonly openai: OpenAI | null = null;
  private readonly MAX_APPROVED_PER_REQUEST = 20;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.openaiApiKey;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      });
    }
  }

  /**
   * Generates multiple-choice questions using OpenAI based on metadata inputs.
   * @param input - The request DTO containing generation parameters
   * @returns Promise resolving to an array of generated questions with tempIds
   * @throws BudgetExceededError if request exceeds limits
   * @throws PromptBuildError if prompt construction fails
   * @throws AiResponseParseError if AI response cannot be parsed
   * @throws ValidationError if generated questions fail validation
   */
  async generateQuestionsWithAI(
    input: GenerateQuestionsRequestDto,
  ): Promise<GeneratedQuestionDto[]> {
    // Validate count limit
    if (input.count > MAX_QUESTIONS_PER_REQUEST) {
      throw new BudgetExceededError(
        `Request exceeds maximum questions per request (${MAX_QUESTIONS_PER_REQUEST}). Requested: ${input.count}`,
      );
    }

    if (input.count < 1) {
      throw new ValidationError('Count must be at least 1');
    }

    // Check if OpenAI is configured
    if (!this.openai) {
      throw new Error(
        'OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.',
      );
    }

    // Default difficulty to medium
    const normalizedInput: GenerateQuestionsRequestDto = {
      ...input,
      difficulty: input.difficulty || 'medium',
    };

    // Build prompt
    let prompt: string;
    try {
      prompt = buildQuestionGenerationPrompt(normalizedInput);
    } catch (error) {
      if (error instanceof PromptBuildError) {
        throw error;
      }
      throw new PromptBuildError(
        'Failed to build prompt',
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    // Estimate token usage (rough estimate: ~100 tokens per question)
    const estimatedTokens = input.count * 100;
    if (estimatedTokens > MAX_TOKENS_PER_REQUEST) {
      throw new BudgetExceededError(
        `Estimated token usage (${estimatedTokens}) exceeds maximum (${MAX_TOKENS_PER_REQUEST})`,
      );
    }

    // Calculate max tokens for response (leave room for prompt)
    const maxTokens = Math.min(
      MAX_TOKENS_PER_REQUEST,
      this.configService.openaiMaxTokens,
    );

    // Call OpenAI
    let response: OpenAI.Chat.Completions.ChatCompletion;
    try {
      response = await this.openai.chat.completions.create(
        {
          model: this.configService.openaiModel,
          messages: [
            {
              role: 'system',
              content:
                'You are a question generator. Always return valid JSON arrays only. No markdown, no explanations.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: maxTokens,
        },
        {
          maxRetries: 0, // Disable retries as specified
        },
      );
    } catch (error) {
      throw new AiResponseParseError(
        `OpenAI API call failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    // Extract content
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AiResponseParseError('OpenAI response contains no content');
    }

    // Parse JSON
    let parsedQuestions: Omit<GeneratedQuestionDto, 'tempId'>[];
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      parsedQuestions = JSON.parse(cleanedContent);
    } catch (error) {
      throw new AiResponseParseError(
        `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    // Validate it's an array
    if (!Array.isArray(parsedQuestions)) {
      throw new AiResponseParseError(
        'AI response is not a JSON array',
        new Error('Expected array, got ' + typeof parsedQuestions),
      );
    }

    // Validate count matches
    if (parsedQuestions.length !== input.count) {
      throw new ValidationError(
        `AI generated ${parsedQuestions.length} questions, but ${input.count} were requested`,
      );
    }

    // Attach tempIds and validate each question
    const generatedQuestions: GeneratedQuestionDto[] = [];
    for (let i = 0; i < parsedQuestions.length; i++) {
      const question = parsedQuestions[i];
      const questionWithId: GeneratedQuestionDto = {
        ...question,
        tempId: uuidv4(),
        // Ensure defaults
        difficulty: question.difficulty || normalizedInput.difficulty,
        points: question.points ?? 1,
      };

      // Validate the question
      try {
        validateGeneratedQuestion(questionWithId);
      } catch (error) {
        throw new ValidationError(
          `Question ${i + 1} failed validation: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      generatedQuestions.push(questionWithId);
    }

    return generatedQuestions;
  }

  /**
   * Commits approved AI-generated questions to the database.
   * Uses a Prisma transaction to ensure atomicity.
   * @param approved - Array of approved questions to commit
   * @param createdBy - User ID of the user creating the questions
   * @returns Promise resolving to the count of inserted questions
   * @throws ValidationError if validation fails
   * @throws Error if database operation fails
   */
  async commitApprovedQuestions(
    approved: GeneratedQuestionDto[],
    createdBy: string,
  ): Promise<number> {
    // Safety guard: reject empty arrays
    if (!Array.isArray(approved) || approved.length === 0) {
      throw new ValidationError('Approved questions array cannot be empty');
    }

    // Safety guard: max approved per request
    if (approved.length > this.MAX_APPROVED_PER_REQUEST) {
      throw new ValidationError(
        `Cannot commit more than ${this.MAX_APPROVED_PER_REQUEST} questions per request. Received: ${approved.length}`,
      );
    }

    // Validate each question
    for (let i = 0; i < approved.length; i++) {
      const question = approved[i];
      try {
        // Re-run validation
        validateGeneratedQuestion(question);

        // Validate category matches enum
        if (
          question.category !== 'aptitude' &&
          question.category !== 'technical'
        ) {
          throw new ValidationError(
            `Question ${i + 1}: Invalid category. Must be 'aptitude' or 'technical'`,
          );
        }

        // Validate type matches enum
        if (
          question.type !== 'single_select' &&
          question.type !== 'multi_select'
        ) {
          throw new ValidationError(
            `Question ${i + 1}: Invalid type. Must be 'single_select' or 'multi_select'`,
          );
        }

        // Validate difficulty exists (default to medium if missing)
        if (
          question.difficulty &&
          question.difficulty !== 'easy' &&
          question.difficulty !== 'medium' &&
          question.difficulty !== 'hard'
        ) {
          throw new ValidationError(
            `Question ${i + 1}: Invalid difficulty. Must be 'easy', 'medium', or 'hard'`,
          );
        }

        // Validate options
        if (!Array.isArray(question.options) || question.options.length < 4) {
          throw new ValidationError(
            `Question ${i + 1}: Must have at least 4 options`,
          );
        }

        // Validate all options have non-empty optionText
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          if (!option.optionText || option.optionText.trim().length === 0) {
            throw new ValidationError(
              `Question ${i + 1}, Option ${j + 1}: optionText must be non-empty`,
            );
          }
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(
          `Question ${i + 1} validation failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Use Prisma transaction to insert all questions atomically
    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          let insertedCount = 0;

          for (const question of approved) {
            // Ensure difficulty defaults to medium
            const difficulty = question.difficulty || 'medium';

            // Insert question with options
            await tx.question.create({
              data: {
                category: question.category,
                type: question.type,
                stem: question.stem.trim(),
                difficulty,
                points: question.points ?? 1,
                createdBy,
                options: {
                  create: question.options.map((opt) => ({
                    optionText: opt.optionText.trim(),
                    isCorrect: opt.isCorrect,
                  })),
                },
              },
            });

            insertedCount++;
          }

          return insertedCount;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      return result;
    } catch (error) {
      // Map Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Database error: Failed to commit questions. ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new ValidationError(`Validation error: ${error.message}`, error);
      }

      // Re-throw ValidationError as-is
      if (error instanceof ValidationError) {
        throw error;
      }

      // Unknown errors
      throw new Error(
        `Failed to commit questions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
