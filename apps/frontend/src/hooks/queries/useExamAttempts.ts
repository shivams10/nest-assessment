import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  startExamService,
  type StartExamRequest,
} from '@/services/exam-attempts.service'
import { ROUTES } from '@/constants'

/**
 * useStartExam - React Query hook for starting an exam
 */
export function useStartExam() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: StartExamRequest) => startExamService(data),
    onSuccess: (data) => {
      navigate(
        ROUTES.CANDIDATE_EXAM_RUNTIME.replace(':submissionId', data.id),
      )
    },
  })
}

