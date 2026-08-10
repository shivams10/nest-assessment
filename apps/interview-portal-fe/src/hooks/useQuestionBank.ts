import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse } from './useTeamMembers'

export type QuestionType   = 'mcq_single' | 'mcq_multi' | 'subjective' | 'coding'
export type QuestionSource = 'ai_generated' | 'manual'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export type QuestionBankOption = {
  text:      string
  isCorrect: boolean
}

export type QuestionBankTestCase = {
  id:             string
  input:          string
  expectedOutput: string
  isHidden:       boolean
  weight:         number
  order:          number
}

export type QuestionAuthor = {
  id:        string
  firstName: string | null
  lastName:  string | null
  email:     string
}

export type QuestionBankListItem = {
  id:         string
  tags:       string[]
  type:       QuestionType
  difficulty: QuestionDifficulty
  source:     QuestionSource
  prompt:     string
  points:     number
  createdAt:  string
  updatedAt:  string
  creator:    QuestionAuthor
}

export type QuestionBankDetailItem = QuestionBankListItem & {
  options:   QuestionBankOption[] | null
  createdBy: string
  updatedBy: string | null
  updater:   QuestionAuthor | null
  testCases: QuestionBankTestCase[]
}

export const authorName = (author: QuestionAuthor | null | undefined) => {
  if (!author) return 'Unknown'
  const name = [author.firstName, author.lastName].filter(Boolean).join(' ')
  return name || author.email
}

export type ListQuestionBankParams = {
  page?:       number
  limit?:      number
  tags?:       string[]
  type?:       QuestionType
  difficulty?: QuestionDifficulty
  search?:     string
}

const fetchQuestionBank = async (
  params: ListQuestionBankParams,
): Promise<PaginatedResponse<QuestionBankListItem>> => {
  const { tags, ...rest } = params
  const { data } = await api.get<PaginatedResponse<QuestionBankListItem>>('/question-bank', {
    params: { ...rest, ...(tags?.length ? { tags: tags.join(',') } : {}) },
  })
  return data
}

export const useQuestionBank = (params: ListQuestionBankParams = {}) =>
  useQuery({
    queryKey: ['question-bank', params],
    queryFn:  () => fetchQuestionBank(params),
  })
