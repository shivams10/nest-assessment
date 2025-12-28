import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RankBadge } from './RankBadge'
import { StatusBadge } from './StatusBadge'
import type { CandidateResult } from '@/types/result.types'

interface ResultSummaryCardProps {
  result: CandidateResult
  examTitle?: string
}

/**
 * ResultSummaryCard - Displays exam result summary
 * Shows total marks, breakdown, rank, and selection status
 */
export function ResultSummaryCard({
  result,
  examTitle,
}: ResultSummaryCardProps) {
  const totalPossible = result.totalMarks // Assuming marks are out of total possible
  const aptitudePercentage = totalPossible > 0
    ? Math.round((result.aptitudeMarks / totalPossible) * 100)
    : 0
  const technicalPercentage = totalPossible > 0
    ? Math.round((result.technicalMarks / totalPossible) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Result Summary</CardTitle>
        {examTitle && (
          <p className="text-sm text-muted-foreground">{examTitle}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Marks */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Marks</p>
          <p className="mt-1 text-4xl font-bold text-primary">
            {result.totalMarks}
          </p>
        </div>

        {/* Marks Breakdown */}
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Aptitude</span>
              <span className="font-medium">
                {result.aptitudeMarks} ({aptitudePercentage}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${aptitudePercentage}%` }}
                role="progressbar"
                aria-valuenow={aptitudePercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Technical</span>
              <span className="font-medium">
                {result.technicalMarks} ({technicalPercentage}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-secondary transition-all"
                style={{ width: `${technicalPercentage}%` }}
                role="progressbar"
                aria-valuenow={technicalPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Rank and Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Rank</p>
            <RankBadge rank={result.rank} />
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Next Round</p>
            <StatusBadge selected={result.selectedForNextRound} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

