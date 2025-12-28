/**
 * Analytics Types
 * Types for admin analytics dashboard
 */

export interface AnalyticsSummary {
  totalCandidates: number
  totalExams: number
  totalSubmissions: number
  selectedForNextRound: number
}

export interface ExamStatistics {
  examId: string
  examTitle: string
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number // Percentage selected for next round
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  examStats: ExamStatistics[]
}

