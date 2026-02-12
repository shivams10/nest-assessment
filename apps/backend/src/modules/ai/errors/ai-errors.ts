/**
 * Custom error types for AI question generation
 */

export class PromptBuildError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'PromptBuildError';
    this.cause = cause;
    Object.setPrototypeOf(this, PromptBuildError.prototype);
  }
}

export class AiResponseParseError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AiResponseParseError';
    this.cause = cause;
    Object.setPrototypeOf(this, AiResponseParseError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ValidationError';
    this.cause = cause;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetExceededError';
    Object.setPrototypeOf(this, BudgetExceededError.prototype);
  }
}
