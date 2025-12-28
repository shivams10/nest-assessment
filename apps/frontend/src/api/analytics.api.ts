/**
 * Analytics API Service
 * Aggregates data from existing endpoints to provide analytics
 * Uses apiClient (axios instance) internally
 */

import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/auth.service'
import type { AnalyticsData, AnalyticsSummary, ExamStatistics } from '@/types/analytics.types'
import { listUsersService } from '@/services/admin.service'
import { listResultsService } from '@/api/results.api'
import { listExamsService } from '@/services/exams.service'

/**
 * Get analytics data
 * Aggregates data from multiple endpoints
 * GET /admin/analytics (if endpoint exists) or aggregate from existing endpoints
 */
export async function getAnalyticsService(): Promise<AnalyticsData> {
  try {
    // Try dedicated analytics endpoint first
    try {
      const response = await apiClient.get<AnalyticsData>('/admin/analytics')
      return response.data
    } catch (endpointError) {
      // If endpoint doesn't exist, aggregate from existing endpoints
      const axiosError = endpointError as AxiosError<ApiErrorResponse>
      if (axiosError.response?.status === 404) {
        // Aggregate from existing endpoints
        return await aggregateAnalyticsData()
      }
      throw endpointError
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to fetch analytics'
    const customError = new Error(errorMessage)
    ;(customError as unknown as { status?: number }).status = axiosError.response?.status
    throw customError
  }
}

/**
 * Aggregate analytics data from existing endpoints
 */
async function aggregateAnalyticsData(): Promise<AnalyticsData> {
  // Fetch data in parallel
  const [usersResponse, resultsResponse, examsResponse] = await Promise.all([
    // Get all candidates (paginated, fetch all)
    listUsersService({ page: 1, limit: 1000 }),
    // Get all results (paginated, fetch all)
    listResultsService({ page: 1, limit: 1000 }),
    // Get all exams
    listExamsService({ page: 1, limit: 1000 }, true),
  ])

  // Calculate summary
  const totalCandidates = (usersResponse?.data || []).filter(
    (user) => user?.role === 'candidate',
  ).length
  const totalExams = (examsResponse?.data || []).length
  const totalSubmissions = (resultsResponse?.items || []).length
  const selectedForNextRound = (resultsResponse?.items || []).filter(
    (result) => result?.selectedForNextRound,
  ).length

  const summary: AnalyticsSummary = {
    totalCandidates,
    totalExams,
    totalSubmissions,
    selectedForNextRound,
  }

  // Calculate exam-wise statistics
  type ExamStatsMapValue = {
    examId: string
    examTitle: string
    submissions: number[]
    selectedCount: number
  }
  const examStatsMap = new Map<string, ExamStatsMapValue>()

  // Initialize map with all exams
  const examsData = examsResponse?.data || []
  examsData.forEach((exam: { id?: string; title?: string }) => {
    if (exam?.id) {
      examStatsMap.set(exam.id, {
        examId: exam.id,
        examTitle: exam?.title || '',
        submissions: [],
        selectedCount: 0,
      })
    }
  })

  // Aggregate results by exam
  const resultsItems = resultsResponse?.items || []
  resultsItems.forEach((result: { examId?: string; totalMarks?: number; selectedForNextRound?: boolean }) => {
    if (result?.examId) {
      const stats = examStatsMap.get(result.examId)
      if (stats) {
        stats.submissions.push(result?.totalMarks || 0)
        if (result?.selectedForNextRound) {
          stats.selectedCount++
        }
      }
    }
  })

  // Calculate statistics for each exam
  const examStatsValues = Array.from<ExamStatsMapValue>(examStatsMap.values())
  const examStats: ExamStatistics[] = examStatsValues
    .map((stats) => {
      const submissions = stats.submissions
      if (submissions.length === 0) {
        return {
          examId: stats.examId,
          examTitle: stats.examTitle,
          totalSubmissions: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
        }
      }

      const sum = submissions.reduce((acc: number, score: number) => acc + score, 0)
      const averageScore = sum / submissions.length
      const highestScore = Math.max(...submissions)
      const lowestScore = Math.min(...submissions)
      const passRate = (stats.selectedCount / submissions.length) * 100

      return {
        examId: stats.examId,
        examTitle: stats.examTitle,
        totalSubmissions: submissions.length,
        averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
        highestScore,
        lowestScore,
        passRate: Math.round(passRate * 100) / 100, // Round to 2 decimal places
      }
    })
    .filter((stats) => stats.totalSubmissions > 0) // Only include exams with submissions
    .sort((a, b) => b.totalSubmissions - a.totalSubmissions) // Sort by submission count

  return {
    summary,
    examStats,
  }
}

