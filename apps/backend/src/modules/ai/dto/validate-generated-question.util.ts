import { GeneratedQuestionDto } from './generate-questions.dto';

/**
 * Validates a generated question DTO according to business rules.
 * @param question - The question to validate
 * @throws Error with descriptive message if validation fails
 */
export function validateGeneratedQuestion(
  question: GeneratedQuestionDto,
): void {
  // Validate stem is non-empty
  if (!question.stem || question.stem.trim().length === 0) {
    throw new Error('Question stem must be non-empty');
  }

  // Validate options array (minimum 4 options per requirement)
  if (!Array.isArray(question.options) || question.options.length < 4) {
    throw new Error('Question must have at least 4 options');
  }

  // Count correct options
  const correctOptions = question.options.filter((opt) => opt.isCorrect);
  const correctCount = correctOptions.length;

  // Validate at least one correct option
  if (correctCount === 0) {
    throw new Error('Question must have at least one correct option');
  }

  // Validate single_select: exactly one correct option
  if (question.type === 'single_select') {
    if (correctCount !== 1) {
      throw new Error(
        `Single-select question must have exactly one correct option, found ${correctCount}`,
      );
    }
  }

  // Validate multi_select: at least two correct options
  if (question.type === 'multi_select') {
    if (correctCount < 2) {
      throw new Error(
        `Multi-select question must have at least two correct options, found ${correctCount}`,
      );
    }
  }

  // Validate optionText is non-empty for all options
  for (let i = 0; i < question.options.length; i++) {
    const option = question.options[i];
    if (!option.optionText || option.optionText.trim().length === 0) {
      throw new Error(`Option ${i + 1} must have non-empty optionText`);
    }
  }
}
