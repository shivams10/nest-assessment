import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

const fetchTags = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>('/question-bank/tags')
  return data
}

export const useQuestionBankTags = () =>
  useQuery({
    queryKey: ['question-bank', 'tags'],
    queryFn:  fetchTags,
  })
