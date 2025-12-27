import { QuestionCategory, QuestionType } from '@prisma/client';

export interface ScoringContext {
  submissionId: string;
}

export interface QuestionWithAnswers {
  questionId: string;
  category: QuestionCategory;
  type: QuestionType;
  correctOptionIds: string[];
  selectedOptionIds: string[];
  points: number;
}
