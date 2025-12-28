/**
 * Bulk Upload React Query Hooks
 * All bulk upload queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  bulkUploadQuestionsService,
  getBulkUploadStatusService,
} from '@/api/bulkUpload.api'
import type {
  BulkUploadRequest,
  BulkUploadResponse,
  BulkUploadStatusResponse,
} from '@/types/bulkUpload.types'

/**
 * Query keys factory for bulk uploads
 */
export const bulkUploadKeys = {
  all: ['bulkUpload'] as const,
  status: (uploadId: string) => [...bulkUploadKeys.all, 'status', uploadId] as const,
}

/**
 * useBulkUploadQuestions - Upload CSV file mutation
 */
export function useBulkUploadQuestions() {
  const queryClient = useQueryClient()

  return useMutation<BulkUploadResponse, Error, BulkUploadRequest>({
    mutationFn: bulkUploadQuestionsService,
    onSuccess: (data) => {
      // Invalidate questions list after successful upload
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      // Start polling for status if upload is processing
      if (data.status === 'processing' || data.status === 'pending') {
        queryClient.setQueryData(bulkUploadKeys.status(data.id), data)
      }
    },
  })
}

/**
 * useBulkUploadStatus - Fetch bulk upload status
 */
export function useBulkUploadStatus(uploadId: string | undefined) {
  return useQuery<BulkUploadStatusResponse, Error>({
    queryKey: bulkUploadKeys.status(uploadId || ''),
    queryFn: () => getBulkUploadStatusService(uploadId!),
    enabled: !!uploadId,
    refetchInterval: (query) => {
      const data = query.state.data
      // Poll every 2 seconds if still processing
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 2000
      }
      // Stop polling if completed or failed
      return false
    },
    staleTime: 0, // Always refetch for status
  })
}

