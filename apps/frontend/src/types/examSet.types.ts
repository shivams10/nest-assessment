/**
 * Exam Set Types
 * Types for exam set and section management
 */

export type SectionType = 'aptitude' | 'technical'

export interface ExamSet {
  id: string
  name: string
  examId: string
  createdAt: string
  sections?: ExamSetSection[]
}

export interface ExamSetSection {
  id: string
  sectionType: SectionType
  questionCount: number
  examSetId: string
  createdAt: string
  assignedQuestions?: number
}

export interface CreateExamSetRequest {
  examId: string
  name: string
}

export interface CreateExamSetSectionRequest {
  examSetId: string
  sectionType: SectionType
  questionCount: number
}

export interface UpdateExamSetSectionRequest {
  questionCount: number
}

export interface ListExamSetsParams {
  examId: string
}

export interface ListExamSetsResponse {
  items: ExamSet[]
  total: number
}

