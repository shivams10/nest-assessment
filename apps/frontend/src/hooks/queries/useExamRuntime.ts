import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  getExamService,
  submitAnswersService,
  submitExamService,
  getExamResultService,
  type SubmitAnswersRequest,
} from '@/services/exam-runtime.service'
import { ROUTES } from '@/constants'

/**
 * useExam - React Query hook for fetching exam data
 */
export function useExam(submissionId: string | undefined) {
  return useQuery({
    queryKey: ['exam', submissionId],
    queryFn: () => getExamService(submissionId!),
    enabled: !!submissionId,
  })
}

/**
 * useSubmitAnswers - React Query hook for submitting answers
 */
export function useSubmitAnswers(submissionId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitAnswersRequest) => submitAnswersService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', submissionId] })
    },
  })
}

/**
 * useSubmitExam - React Query hook for submitting exam
 */
export function useSubmitExam(submissionId: string | undefined) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => submitExamService(submissionId!),
    onSuccess: () => {
      if (submissionId) {
        queryClient.invalidateQueries({ queryKey: ['exams', 'candidate'] })
        navigate(
          ROUTES.CANDIDATE_EXAM_SUCCESS.replace(':submissionId', submissionId),
        )
      }
    },
  })
}

/**
 * useExamResult - React Query hook for fetching exam result
 */
export function useExamResult(submissionId: string | undefined) {
  return useQuery({
    queryKey: ['exam-result', submissionId],
    queryFn: () => getExamResultService(submissionId!),
    enabled: !!submissionId,
  })
}

