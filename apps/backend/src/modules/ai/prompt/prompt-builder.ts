import { GenerateQuestionsRequestDto } from '../dto/generate-questions.dto';
import { PromptBuildError } from '../errors/ai-errors';

/**
 * Builds the AI prompt for question generation.
 * @param input - The request DTO containing generation parameters
 * @returns The formatted prompt string
 * @throws PromptBuildError if prompt construction fails
 */
export function buildQuestionGenerationPrompt(
  input: GenerateQuestionsRequestDto,
): string {
  try {
    const difficulty = input.difficulty || 'medium';
    const count = input.count;

    const prompt = `You are an expert question generator for an online assessment platform. Generate exactly ${count} multiple-choice questions based on the following specifications.

REQUIREMENTS:
- Category: ${input.category}
- Type: ${input.type}
- Difficulty: ${difficulty}
- Count: Exactly ${count} questions

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown, no commentary, no explanations. The JSON must be parseable.

Each question object must have this exact structure:
{
  "stem": "string (the question text)",
  "category": "${input.category}",
  "type": "${input.type}",
  "difficulty": "${difficulty}",
  "points": 1,
  "options": [
    {
      "optionText": "string",
      "isCorrect": boolean
    }
  ]
}

VALIDATION RULES:
1. Each question must have exactly 4 or more options.
2. For single_select type: Exactly ONE option must have isCorrect=true.
3. For multi_select type: At least TWO options must have isCorrect=true.
4. All optionText values must be non-empty strings.
5. The stem must be a clear, well-formed question.
6. Points must be 1 for all questions.

Generate exactly ${count} questions. Return the JSON array directly.`;

    return prompt;
  } catch (error) {
    throw new PromptBuildError(
      'Failed to build question generation prompt',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}
