/**
 * Bulk Upload Types
 * Types for CSV bulk upload functionality
 */

export interface BulkUploadRequest {
  file: File
  collegeSessionId?: string
}

export interface BulkUploadResponse {
  uploadId: string
}

export type BulkUploadStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface BulkUploadStatusResponse {
  id: string
  status: BulkUploadStatus
  totalRows: number
  processedRows: number
  successCount: number
  failedCount: number
  errorFileUrl: string | null
  createdAt: string
  updatedAt: string
}

