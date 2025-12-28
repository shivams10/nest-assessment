import { useMemo } from 'react'
import { useAnalytics } from '@/queries/analytics.queries'
import { StatsCard } from '@/components/analytics/StatsCard'
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonLoader'
import { formatError } from '@/utils/errorFormatter'

/**
 * AdminAnalyticsPage - Admin analytics dashboard
 * Route: /admin/analytics
 * Features:
 * - Summary cards (candidates, exams, submissions, selected)
 * - Exam-wise statistics with charts
 * - Server-driven data via TanStack Query
 * - Read-only dashboard
 */
export function AdminAnalyticsPage() {
  const { data, isLoading, isError, error } = useAnalytics()

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || !data.examStats || data.examStats.length === 0) return []

    const maxScore = Math.max(
      ...data.examStats.map((stat) => stat.highestScore),
      100, // Default max
    )

    return data.examStats.map((stat) => ({
      label: stat.examTitle,
      value: stat.averageScore,
      maxValue: maxScore,
      color: 'bg-primary',
    }))
  }, [data])

  const passRateData = useMemo(() => {
    if (!data || !data.examStats || data.examStats.length === 0) return []

    return data.examStats.map((stat) => ({
      label: stat.examTitle,
      value: stat.passRate,
      maxValue: 100,
      color: 'bg-green-500',
    }))
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    const formattedError = formatError(error)
    return (
      <ErrorState
        message={formattedError.message}
        onRetry={formattedError.canRetry ? () => window.location.reload() : undefined}
      />
    )
  }

  if (!data) {
    return <EmptyState description="No analytics data available" />
  }

  const { summary, examStats } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Overview of exam performance and candidate statistics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Candidates"
          value={summary.totalCandidates}
          description="Registered candidates"
        />
        <StatsCard
          title="Total Exams"
          value={summary.totalExams}
          description="Created exams"
        />
        <StatsCard
          title="Total Submissions"
          value={summary.totalSubmissions}
          description="Completed exams"
        />
        <StatsCard
          title="Selected for Next Round"
          value={summary.selectedForNextRound}
          description={`${
            summary.totalSubmissions > 0
              ? Math.round((summary.selectedForNextRound / summary.totalSubmissions) * 100)
              : 0
          }% selection rate`}
        />
      </div>

      {/* Exam Statistics */}
      {examStats.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SimpleBarChart
            title="Average Scores by Exam"
            data={chartData}
            valueLabel={value => `${value.toFixed(1)}%`}
          />

          <SimpleBarChart
            title="Pass Rate by Exam"
            data={passRateData}
            valueLabel={value => `${value.toFixed(1)}%`}
          />
        </div>
      ) : (
        <EmptyState description="No exam statistics available" />
      )}

      {/* Exam Details Table */}
      {examStats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Exam Performance Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examStats.map(stat => (
              <div key={stat.examId} className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold text-foreground">{stat.examTitle}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submissions:</span>
                    <span className="font-medium">{stat.totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Score:</span>
                    <span className="font-medium">{stat.averageScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Highest:</span>
                    <span className="font-medium">{stat.highestScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lowest:</span>
                    <span className="font-medium">{stat.lowestScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pass Rate:</span>
                    <span className="font-medium">{stat.passRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
