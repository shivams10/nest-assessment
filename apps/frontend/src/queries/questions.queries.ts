/**
 * Questions React Query Hooks
 * All question bank queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listQuestionsService,
  createQuestionService,
  getSectionQuestionsService,
  assignQuestionsService,
} from '@/api/questions.api'
import type {
  Question,
  CreateQuestionRequest,
  AssignQuestionsRequest,
  ListQuestionsParams,
  ListQuestionsResponse,
  SectionQuestionsResponse,
} from '@/types/question.types'

/**
 * Query keys factory for questions
 */
export const questionsKeys = {
  all: ['questions'] as const,
  list: (params?: ListQuestionsParams) => [...questionsKeys.all, 'list', params] as const,
  detail: (questionId: string) => [...questionsKeys.all, 'detail', questionId] as const,
  section: (sectionId: string) => [...questionsKeys.all, 'section', sectionId] as const,
}

/**
 * useQuestions - Fetch list of questions from question bank
 */
export function useQuestions(params?: ListQuestionsParams) {
  return useQuery<ListQuestionsResponse, Error>({
    queryKey: questionsKeys.list(params),
    queryFn: () => listQuestionsService(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useCreateQuestion - Create question mutation
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation<Question, Error, CreateQuestionRequest>({
    mutationFn: createQuestionService,
    onSuccess: () => {
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: questionsKeys.all })
    },
  })
}

/**
 * useSectionQuestions - Fetch questions for a section
 */
export function useSectionQuestions(sectionId: string | undefined) {
  return useQuery<SectionQuestionsResponse, Error>({
    queryKey: questionsKeys.section(sectionId || ''),
    queryFn: () => getSectionQuestionsService(sectionId!),
    enabled: !!sectionId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

/**
 * useAssignQuestions - Assign questions to section mutation
 */
export function useAssignQuestions() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, AssignQuestionsRequest>({
    mutationFn: assignQuestionsService,
    onSuccess: (_, variables) => {
      // Invalidate section questions
      queryClient.invalidateQueries({
        queryKey: questionsKeys.section(variables.examSetSectionId),
      })
      // Invalidate questions list to update assignment status
      queryClient.invalidateQueries({ queryKey: questionsKeys.all })
    },
  })
}

