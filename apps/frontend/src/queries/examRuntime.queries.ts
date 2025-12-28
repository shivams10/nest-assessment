/**
 * Exam Runtime React Query Hooks
 * All exam runtime related queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  getExamService,
  submitAnswersService,
  submitExamService,
  getExamResultService,
  type SubmitAnswersRequest,
} from '@/services/exam-runtime.service'
import { startExamService } from '@/services/exam-attempts.service'
import { listExamsService } from '@/services/exams.service'
import { submitMonitoringEventService } from '@/api/exam.runtime.api'
import { ROUTES } from '@/constants'
import { resultsKeys } from '@/queries/results.queries'

/**
 * Query keys factory for exam runtime
 */
export const examRuntimeKeys = {
  all: ['exam-runtime'] as const,
  exam: (submissionId: string) => [...examRuntimeKeys.all, 'exam', submissionId] as const,
  result: (submissionId: string) => [...examRuntimeKeys.all, 'result', submissionId] as const,
  exams: (params?: unknown) => [...examRuntimeKeys.all, 'exams', params] as const,
}

/**
 * useExam - Fetch exam data for a submission
 * Refetches every 30 seconds to sync timer
 * Note: expiresAt is calculated from startedAt + duration (duration from exam metadata)
 */
export function useExam(submissionId: string | undefined) {
  return useQuery({
    queryKey: examRuntimeKeys.exam(submissionId || ''),
    queryFn: async () => {
      if (!submissionId) throw new Error('Submission ID is required')
      const examData = await getExamService(submissionId)
      
      // Calculate expiresAt if we have startedAt
      // We need exam duration - for now, we'll need to get it from exam metadata
      // This is a limitation - backend should return expiresAt or duration
      if (examData.startedAt) {
        // Try to get duration from exam list or calculate
        // For now, we'll need to fetch exam metadata separately
        // TODO: Backend should return duration or expiresAt in exam runtime response
      }
      
      return examData
    },
    enabled: !!submissionId,
    refetchInterval: 30000, // Refetch every 30 seconds to sync timer
    refetchIntervalInBackground: false, // Only refetch when tab is active
  })
}

/**
 * useExamMeta - Fetch exam metadata
 * Used for exam start page
 */
export function useExamMeta(examId: string | undefined) {
  return useQuery({
    queryKey: ['exam-meta', examId],
    queryFn: async () => {
      // Try to get from exam list first, or use a placeholder
      // Backend may need GET /exams/:id endpoint
      const exams = await listExamsService({ limit: 100 }, false)
      const exam = exams?.data?.find((e) => e?.id === examId)
      if (!exam) {
        throw new Error('Exam not found')
      }
      return {
        id: exam?.id || '',
        title: exam?.title || '',
        description: exam?.description,
        durationSeconds: exam?.durationSeconds || 3600,
        instructions: exam?.description || 'Please read all questions carefully before answering.',
      }
    },
    enabled: !!examId,
  })
}

/**
 * useSubmitAnswers - Submit answers mutation
 */
export function useSubmitAnswers(submissionId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitAnswersRequest) => submitAnswersService(data),
    onSuccess: () => {
      // Invalidate exam query to get fresh data
      if (submissionId) {
        queryClient.invalidateQueries({
          queryKey: examRuntimeKeys.exam(submissionId),
        })
      }
    },
  })
}

/**
 * useSubmitExam - Submit exam mutation
 */
export function useSubmitExam(submissionId: string | undefined) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!submissionId) throw new Error('Submission ID is required')
      return submitExamService(submissionId)
    },
    onSuccess: () => {
      if (submissionId) {
        // Prefetch candidate result for better UX
        queryClient.prefetchQuery({
          queryKey: resultsKeys.candidate(submissionId),
          queryFn: async () => {
            const { getCandidateResultService } = await import('@/api/results.api')
            return getCandidateResultService(submissionId)
          },
        })
        navigate(
          ROUTES.CANDIDATE_EXAM_RESULT.replace(':submissionId', submissionId),
        )
      }
    },
  })
}

/**
 * useStartExam - Start exam mutation
 */
export function useStartExam() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (examId: string) => startExamService({ examId }),
    onSuccess: (data) => {
      // Navigate to exam start page first, then user can proceed to runtime
      navigate(`/exam/${data.id}/start`)
    },
  })
}

/**
 * useExamResult - Fetch exam result
 */
export function useExamResult(submissionId: string | undefined) {
  return useQuery({
    queryKey: examRuntimeKeys.result(submissionId || ''),
    queryFn: () => {
      if (!submissionId) throw new Error('Submission ID is required')
      return getExamResultService(submissionId)
    },
    enabled: !!submissionId,
  })
}

/**
 * useMonitoringEvent - Submit monitoring event mutation
 */
export function useMonitoringEvent() {
  return useMutation({
    mutationFn: (data: { submissionId: string; eventType: 'tab_switch' | 'blur' | 'focus' }) =>
      submitMonitoringEventService(data),
    // Fail silently - don't break exam flow if monitoring fails
    onError: () => {
      // Log but don't throw
    },
  })
}

