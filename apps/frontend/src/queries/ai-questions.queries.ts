/**
 * AI Questions React Query Hooks
 * Hooks for AI question generation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import { questionsKeys } from './questions.queries'
import type {
  GenerateQuestionsRequest,
  PreviewQuestionsResponse,
  GeneratedQuestion,
} from '@/types/ai-question.types'

/**
 * Query keys factory for AI questions
 */
export const aiQuestionsKeys = {
  all: ['ai-questions'] as const,
  preview: () => [...aiQuestionsKeys.all, 'preview'] as const,
  commit: () => [...aiQuestionsKeys.all, 'commit'] as const,
}

export interface CommitQuestionsRequest {
  approved: GeneratedQuestion[]
}

export interface CommitQuestionsResponse {
  insertedCount: number
}

/**
 * useGenerateAiQuestions - Generate AI questions mutation
 */
export function useGenerateAiQuestions() {
  return useMutation<PreviewQuestionsResponse, Error, GenerateQuestionsRequest>(
    {
      mutationFn: async (data: GenerateQuestionsRequest) => {
        try {
          const response = await apiClient.post<PreviewQuestionsResponse>(
            '/api/ai/questions/preview',
            data,
          )
          return response.data
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            'Failed to generate questions'
          const customError = new Error(errorMessage)
          ;(customError as unknown as { status?: number }).status =
            axiosError.response?.status
          throw customError
        }
      },
    },
  )
}

/**
 * useCommitAiQuestions - Commit approved AI questions mutation
 */
export function useCommitAiQuestions() {
  const queryClient = useQueryClient()

  return useMutation<CommitQuestionsResponse, Error, CommitQuestionsRequest>({
    mutationFn: async (data: CommitQuestionsRequest) => {
      try {
        const response = await apiClient.post<CommitQuestionsResponse>(
          '/api/ai/questions/commit',
          data,
        )
        return response.data
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to commit questions'
        const customError = new Error(errorMessage)
        ;(customError as unknown as { status?: number }).status =
          axiosError.response?.status
        throw customError
      }
    },
    onSuccess: () => {
      // Invalidate questions list to show newly added questions
      queryClient.invalidateQueries({ queryKey: questionsKeys.all })
    },
  })
}
