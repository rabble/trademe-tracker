import { useQuery } from '@tanstack/react-query'
import { AnalyticsService, PropertyChange } from '../../services/analytics/analyticsService'

/**
 * Hook for fetching recent property changes
 * 
 * @param limit - Optional limit for the number of changes to fetch
 * @returns Query result with recent property changes and query status
 */
export function useRecentChanges(limit: number = 10) {
  return useQuery<PropertyChange[]>({
    queryKey: ['recentChanges', limit],
    queryFn: () => AnalyticsService.fetchRecentChanges(limit),
    staleTime: 60 * 1000, // 1 minute
  })
}
