/**
 * Question Types
 * Types for question bank and question management
 */

export type QuestionType = 'single_select' | 'multi_select'
export type QuestionCategory = string

export interface Question {
  id: string
  stem: string
  type: QuestionType
  category: QuestionCategory
  options: QuestionOption[]
  createdAt?: string
  updatedAt?: string
  isAssigned?: boolean
}

export interface QuestionOption {
  id: string
  optionText: string
  isCorrect?: boolean
}

export interface CreateQuestionRequest {
  stem: string
  type: QuestionType
  category: QuestionCategory
  options: Omit<QuestionOption, 'id'>[]
}

export interface AssignQuestionsRequest {
  examSetSectionId: string
  questionIds: string[]
}

export interface ListQuestionsParams {
  page?: number
  limit?: number
  category?: string
  type?: QuestionType
  search?: string
}

export interface ListQuestionsResponse {
  items: Question[]
  total: number
  page?: number
  limit?: number
}

export interface SectionQuestionsResponse {
  assignedQuestions: Question[]
  availableQuestions: Question[]
}

export interface UpdateQuestionRequest {
  stem?: string
  type?: QuestionType
  category?: QuestionCategory
  options?: Omit<QuestionOption, 'id'>[]
}

