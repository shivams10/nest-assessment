/**
 * Exam Sets React Query Hooks
 * All exam set management queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listExamSetsService,
  createExamSetService,
  deleteExamSetService,
  createExamSetSectionService,
  updateExamSetSectionService,
} from '@/api/examSets.api'
import type {
  ExamSet,
  ExamSetSection,
  CreateExamSetRequest,
  CreateExamSetSectionRequest,
  UpdateExamSetSectionRequest,
  ListExamSetsParams,
  ListExamSetsResponse,
} from '@/types/examSet.types'

/**
 * Query keys factory for exam sets
 */
export const examSetsKeys = {
  all: ['examSets'] as const,
  list: (params: ListExamSetsParams) => [...examSetsKeys.all, 'list', params] as const,
  detail: (setId: string) => [...examSetsKeys.all, 'detail', setId] as const,
}

/**
 * useExamSets - Fetch list of exam sets for an exam
 */
export function useExamSets(
  params: ListExamSetsParams,
  options?: { enabled?: boolean },
) {
  return useQuery<ListExamSetsResponse, Error>({
    queryKey: examSetsKeys.list(params),
    queryFn: () => listExamSetsService(params),
    enabled: options?.enabled !== false && !!params.examId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useCreateExamSet - Create exam set mutation
 */
export function useCreateExamSet() {
  const queryClient = useQueryClient()

  return useMutation<ExamSet, Error, CreateExamSetRequest>({
    mutationFn: createExamSetService,
    onSuccess: (_, variables) => {
      // Invalidate exam sets list for this exam
      queryClient.invalidateQueries({
        queryKey: examSetsKeys.list({ examId: variables.examId }),
      })
    },
  })
}

/**
 * useDeleteExamSet - Delete exam set mutation
 */
export function useDeleteExamSet() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { setId: string; examId: string }>({
    mutationFn: ({ setId }) => deleteExamSetService(setId),
    onSuccess: (_, variables) => {
      // Invalidate exam sets list for this exam
      queryClient.invalidateQueries({
        queryKey: examSetsKeys.list({ examId: variables.examId }),
      })
    },
  })
}

/**
 * useCreateExamSetSection - Create exam set section mutation
 */
export function useCreateExamSetSection() {
  const queryClient = useQueryClient()

  return useMutation<ExamSetSection, Error, CreateExamSetSectionRequest>({
    mutationFn: createExamSetSectionService,
    onSuccess: () => {
      // Invalidate exam sets list to refresh sections
      queryClient.invalidateQueries({ queryKey: examSetsKeys.all })
    },
  })
}

/**
 * useUpdateExamSetSection - Update exam set section mutation
 */
export function useUpdateExamSetSection() {
  const queryClient = useQueryClient()

  return useMutation<
    ExamSetSection,
    Error,
    { sectionId: string; data: UpdateExamSetSectionRequest }
  >({
    mutationFn: ({ sectionId, data }) => updateExamSetSectionService(sectionId, data),
    onSuccess: () => {
      // Invalidate exam sets list to refresh sections
      queryClient.invalidateQueries({ queryKey: examSetsKeys.all })
    },
  })
}

