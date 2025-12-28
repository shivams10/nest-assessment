/**
 * Bulk Upload API Service
 * Pure service functions for CSV bulk upload API calls
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type {
  BulkUploadRequest,
  BulkUploadResponse,
  BulkUploadStatusResponse,
} from '@/types/bulkUpload.types'

/**
 * Upload CSV file for bulk question import
 * POST /admin/questions/bulk-upload
 */
export async function bulkUploadQuestionsService(
  data: BulkUploadRequest,
): Promise<BulkUploadResponse> {
  try {
    const formData = new FormData()
    formData.append('file', data.file)

    const response = await apiClient.post<BulkUploadResponse>(
      '/admin/questions/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to upload CSV file'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Get bulk upload status
 * GET /admin/questions/bulk-upload/:id/status
 */
export async function getBulkUploadStatusService(
  uploadId: string,
): Promise<BulkUploadStatusResponse> {
  try {
    const response = await apiClient.get<BulkUploadStatusResponse>(
      `/admin/questions/bulk-upload/${uploadId}/status`,
    )
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch upload status'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Download error CSV
 * GET /uploads/:filename
 */
export async function downloadErrorCsvService(url: string): Promise<Blob> {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to download error CSV'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

