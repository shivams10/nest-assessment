/**
 * Analytics React Query Hooks
 * All analytics related queries with performance optimizations
 */

import { useQuery } from '@tanstack/react-query'
import { getAnalyticsService } from '@/api/analytics.api'
import type { AnalyticsData } from '@/types/analytics.types'

/**
 * Query keys factory for analytics
 */
export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
}

/**
 * useAnalytics - Fetch analytics data
 * Uses staleTime to reduce unnecessary refetches
 * Analytics data doesn't change frequently
 */
export function useAnalytics() {
  return useQuery<AnalyticsData, Error>({
    queryKey: analyticsKeys.summary(),
    queryFn: getAnalyticsService,
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics data is relatively stable
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus for analytics
    refetchOnMount: true, // Refetch on mount to get fresh data
  })
}

