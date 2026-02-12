/**
 * AI Question Generation Types
 */

export type GenerateQuestionsCategory = 'aptitude' | 'technical'
export type GenerateQuestionsType = 'single_select' | 'multi_select'
export type GenerateQuestionsDifficulty = 'easy' | 'medium' | 'hard'

export interface GenerateQuestionsRequest {
  category: GenerateQuestionsCategory
  type: GenerateQuestionsType
  difficulty?: GenerateQuestionsDifficulty
  count: number
}

export interface GeneratedQuestionOption {
  optionText: string
  isCorrect: boolean
}

export interface GeneratedQuestion {
  tempId: string
  category: GenerateQuestionsCategory
  type: GenerateQuestionsType
  difficulty: GenerateQuestionsDifficulty
  stem: string
  points: number
  options: GeneratedQuestionOption[]
}

export interface PreviewQuestionsResponse {
  generated: GeneratedQuestion[]
}

export interface CommitQuestionsRequest {
  approved: GeneratedQuestion[]
}

export interface CommitQuestionsResponse {
  insertedCount: number
}
