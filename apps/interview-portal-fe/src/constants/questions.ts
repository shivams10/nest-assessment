import type { QuestionType } from '@/hooks/useQuestionBank'

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  mcq_single: 'Multiple choice — single answer',
  mcq_multi:  'Multiple choice — multiple answers',
  subjective: 'Subjective',
  coding:     'Coding',
}

export const QUESTION_TYPE_SHORT_LABEL: Record<QuestionType, string> = {
  mcq_single: 'MCQ',
  mcq_multi:  'MCQ · multi',
  subjective: 'Subjective',
  coding:     'Coding',
}
