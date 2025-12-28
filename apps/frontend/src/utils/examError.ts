/**
 * Custom error class for exam-related errors with structured data
 */
export class ExamPublishError extends Error {
  code: string
  reasons: string[]
  statusCode?: number

  constructor(message: string, code: string, reasons: string[] = [], statusCode?: number) {
    super(message)
    this.name = 'ExamPublishError'
    this.code = code
    this.reasons = reasons
    this.statusCode = statusCode
  }
}

