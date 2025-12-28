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
  getExamService,
  updateExamService,
  deleteExamService,
} from '@/api/exams.api'
import type {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
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
  detail: (id: string) => [...examsKeys.all, 'detail', id] as const,
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
 * useExam - Fetch single exam by ID
 */
export function useExam(id: string | undefined) {
  return useQuery<Exam, Error>({
    queryKey: examsKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Exam ID is required')
      return getExamService(id)
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
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
 * useUpdateExam - Update exam mutation
 */
export function useUpdateExam() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<
    Exam,
    Error,
    { id: string; data: UpdateExamRequest }
  >({
    mutationFn: ({ id, data }) => updateExamService(id, data),
    onSuccess: (_, variables) => {
      // Invalidate exams list and detail
      queryClient.invalidateQueries({ queryKey: examsKeys.all })
      queryClient.invalidateQueries({
        queryKey: examsKeys.detail(variables.id),
      })
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
          if (!old || !old.data) return old
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
          if (!old || !old.data) return old
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

/**
 * useDeleteExam - Delete exam mutation
 */
export function useDeleteExam() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteExamService,
    onSuccess: () => {
      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: examsKeys.all })
    },
  })
}
