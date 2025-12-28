/**
 * Exams React Query Hooks
 * All exam management queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  listExamsService,
  createExamService,
  publishExamService,
  unpublishExamService,
} from '@/api/exams.api'
import type {
  Exam,
  CreateExamRequest,
  ListExamsParams,
  ListExamsResponse,
} from '@/types/exam.types'
import { ROUTES } from '@/constants'

/**
 * Query keys factory for exams
 */
export const examsKeys = {
  all: ['exams'] as const,
  admin: (params?: ListExamsParams) => [...examsKeys.all, 'admin', params] as const,
}

/**
 * useAdminExams - Fetch list of exams for admin
 */
export function useAdminExams(params?: ListExamsParams) {
  return useQuery<ListExamsResponse, Error>({
    queryKey: examsKeys.admin(params),
    queryFn: () => listExamsService(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * useCreateExam - Create exam mutation
 */
export function useCreateExam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<Exam, Error, CreateExamRequest>({
    mutationFn: createExamService,
    onSuccess: () => {
      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: examsKeys.all })
      // Navigate back to exams list
      navigate(ROUTES.ADMIN_EXAMS)
    },
  })
}

/**
 * usePublishExam - Publish exam mutation with optimistic update
 */
export function usePublishExam() {
  const queryClient = useQueryClient()

  return useMutation<
    Exam,
    Error,
    string,
    { previousExams?: ListExamsResponse }
  >({
    mutationFn: publishExamService,
    onMutate: async (examId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: examsKeys.all })

      // Snapshot previous value
      const previousExams = queryClient.getQueryData<ListExamsResponse>(
        examsKeys.admin({}),
      )

      // Optimistically update
      queryClient.setQueryData<ListExamsResponse>(
        examsKeys.admin({}),
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map((exam) =>
              exam.id === examId ? { ...exam, isPublished: true } : exam,
            ),
          }
        },
      )

      return { previousExams }
    },
    onError: (_err, _examId, context) => {
      // Rollback on error
      if (context?.previousExams) {
        queryClient.setQueryData(examsKeys.admin({}), context.previousExams)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: examsKeys.all })
    },
  })
}

/**
 * useUnpublishExam - Unpublish exam mutation with optimistic update
 */
export function useUnpublishExam() {
  const queryClient = useQueryClient()

  return useMutation<
    Exam,
    Error,
    string,
    { previousExams?: ListExamsResponse }
  >({
    mutationFn: unpublishExamService,
    onMutate: async (examId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: examsKeys.all })

      // Snapshot previous value
      const previousExams = queryClient.getQueryData<ListExamsResponse>(
        examsKeys.admin({}),
      )

      // Optimistically update
      queryClient.setQueryData<ListExamsResponse>(
        examsKeys.admin({}),
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map((exam) =>
              exam.id === examId ? { ...exam, isPublished: false } : exam,
            ),
          }
        },
      )

      return { previousExams }
    },
    onError: (_err, _examId, context) => {
      // Rollback on error
      if (context?.previousExams) {
        queryClient.setQueryData(examsKeys.admin({}), context.previousExams)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: examsKeys.all })
    },
  })
}
