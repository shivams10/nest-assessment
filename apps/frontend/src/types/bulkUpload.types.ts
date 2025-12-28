/**
 * Bulk Upload Types
 * Types for CSV bulk upload functionality
 */

export interface BulkUploadRequest {
  file: File
  collegeSessionId?: string
}

export interface BulkUploadResponse {
  id: string
  status: BulkUploadStatus
  totalRows: number
  successCount: number
  failedCount: number
  errorCsvUrl?: string
  createdAt: string
}

export type BulkUploadStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface BulkUploadStatusResponse {
  id: string
  status: BulkUploadStatus
  totalRows: number
  successCount: number
  failedCount: number
  errorCsvUrl?: string
  progress?: number
  message?: string
}

