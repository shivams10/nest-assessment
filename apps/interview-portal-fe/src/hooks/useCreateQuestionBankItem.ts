import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  QuestionBankDetailItem,
  QuestionBankOption,
  QuestionDifficulty,
  QuestionType,
} from './useQuestionBank'

export type CreateQuestionBankItemInput = {
  tags:        string[]
  type:        QuestionType
  difficulty?: QuestionDifficulty
  prompt:      string
  points?:     number
  options?:    QuestionBankOption[]
  testCases?: {
    input:          string
    expectedOutput: string
    isHidden?:      boolean
    weight?:        number
  }[]
}

const createQuestionBankItem = async (
  input: CreateQuestionBankItemInput,
): Promise<QuestionBankDetailItem> => {
  const { data } = await api.post<QuestionBankDetailItem>('/question-bank', input)
  return data
}

export const useCreateQuestionBankItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuestionBankItem,
    onSuccess: () => {
      // Also refreshes the tag list, since a new question can introduce tags.
      queryClient.invalidateQueries({ queryKey: ['question-bank'] })
    },
  })
}
