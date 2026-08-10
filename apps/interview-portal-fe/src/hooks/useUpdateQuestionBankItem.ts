import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  QuestionBankDetailItem,
  QuestionBankOption,
  QuestionDifficulty,
} from './useQuestionBank'

// `type` is fixed once a question exists, so it is not part of this payload.
export type UpdateQuestionBankItemInput = {
  id:          string
  tags?:       string[]
  difficulty?: QuestionDifficulty
  prompt?:     string
  points?:     number
  options?:    QuestionBankOption[]
  testCases?: {
    input:          string
    expectedOutput: string
    isHidden?:      boolean
    weight?:        number
  }[]
}

const updateQuestionBankItem = async ({
  id,
  ...body
}: UpdateQuestionBankItemInput): Promise<QuestionBankDetailItem> => {
  const { data } = await api.patch<QuestionBankDetailItem>(`/question-bank/${id}`, body)
  return data
}

export const useUpdateQuestionBankItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateQuestionBankItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] })
    },
  })
}
