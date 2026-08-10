import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { QuestionBankDetailItem } from './useQuestionBank'

const fetchQuestionBankItem = async (id: string): Promise<QuestionBankDetailItem> => {
  const { data } = await api.get<QuestionBankDetailItem>(`/question-bank/${id}`)
  return data
}

export const useQuestionBankItem = (id: string | undefined) =>
  useQuery({
    queryKey: ['question-bank', id],
    queryFn:  () => fetchQuestionBankItem(id as string),
    enabled:  Boolean(id),
  })
