import { useState } from 'react'
import { useBulkUploadQuestions, useBulkUploadStatus } from '@/queries/bulkUpload.queries'
import { downloadErrorCsvService } from '@/api/bulkUpload.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

/**
 * BulkUploadPage - CSV bulk upload page
 * Route: /admin/bulk-upload
 */
export function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadId, setUploadId] = useState<string | null>(null)

  const uploadMutation = useBulkUploadQuestions()
  const { data: statusData } = useBulkUploadStatus(uploadId || undefined)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadId(null)
    }
  }

  const handleUpload = () => {
    if (!file) return

    uploadMutation.mutate(
      { file },
      {
        onSuccess: (data) => {
          setUploadId(data.uploadId)
        },
      },
    )
  }

  const handleDownloadErrorCsv = async () => {
    if (!statusData?.errorFileUrl) return

    try {
      const blob = await downloadErrorCsvService(statusData.errorFileUrl)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bulk-upload-errors-${statusData.id}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to download error CSV')
    }
  }

  const isProcessing = statusData?.status === 'processing'
  const isCompleted = statusData?.status === 'completed'
  const hasErrors = statusData?.failedCount && statusData.failedCount > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Upload</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload questions via CSV file
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file with questions. Expected format: stem, type, category,
            option1, option2, option3, option4, correctOptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending || isProcessing}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending || isProcessing}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </CardContent>
      </Card>

      {uploadMutation.isError && (
        <ErrorState
          message={
            uploadMutation.error instanceof Error
              ? uploadMutation.error.message
              : 'Failed to upload CSV file'
          }
        />
      )}

      {statusData && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing ? (
              <LoadingState message="Processing upload..." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                    <div className="text-2xl font-bold">{statusData.totalRows}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                    <div className="text-2xl font-bold">
                      {statusData.processedRows ?? statusData.successCount + statusData.failedCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                    <div className="text-2xl font-bold text-green-600">
                      {statusData.successCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                    <div className="text-2xl font-bold text-red-600">
                      {statusData.failedCount}
                    </div>
                  </div>
                </div>

                {hasErrors && statusData.errorFileUrl && (
                  <Button variant="outline" onClick={handleDownloadErrorCsv}>
                    Download Error CSV
                  </Button>
                )}

                {isCompleted && !hasErrors && (
                  <div className="text-sm text-green-600">
                    ✓ All questions uploaded successfully
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
