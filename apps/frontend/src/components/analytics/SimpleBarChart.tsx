import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BarData {
  label: string
  value: number
  maxValue: number
  color?: string
}

interface SimpleBarChartProps {
  title: string
  data: BarData[]
  valueLabel?: (value: number) => string
  className?: string
}

/**
 * SimpleBarChart - Lightweight CSS-based bar chart
 * No external charting libraries
 * Accessible and responsive
 */
export function SimpleBarChart({
  title,
  data,
  valueLabel,
  className,
}: SimpleBarChartProps) {
  const formatValue = valueLabel || ((value: number) => value.toString())

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="list" aria-label={title}>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available
            </p>
          ) : (
            data.map((item, index) => {
              const percentage = item.maxValue > 0
                ? Math.min((item.value / item.maxValue) * 100, 100)
                : 0

              return (
                <div
                  key={index}
                  className="space-y-1"
                  role="listitem"
                  aria-label={`${item.label}: ${formatValue(item.value)}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground truncate flex-1 mr-2">
                      {item.label}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {formatValue(item.value)}
                    </span>
                  </div>
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full transition-all duration-500 ease-out',
                        item.color || 'bg-primary',
                      )}
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={item.value}
                      aria-valuemin={0}
                      aria-valuemax={item.maxValue}
                      aria-label={`${item.label}: ${formatValue(item.value)}`}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

