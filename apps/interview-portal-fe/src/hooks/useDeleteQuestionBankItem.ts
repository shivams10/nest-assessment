import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const deleteQuestionBankItem = async (id: string): Promise<void> => {
  await api.delete(`/question-bank/${id}`)
}

export const useDeleteQuestionBankItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuestionBankItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] })
    },
  })
}
