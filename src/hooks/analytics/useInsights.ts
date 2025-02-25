import { useQuery } from '@tanstack/react-query'
import { AnalyticsService, PropertyInsight } from '../../services/analytics/analyticsService'

/**
 * Hook for fetching property insights
 * 
 * @param propertyId - Optional property ID to filter insights
 * @param limit - Optional limit for the number of insights to fetch
 * @returns Query result with property insights and query status
 */
export function useInsights(propertyId?: string, limit: number = 10) {
  return useQuery<PropertyInsight[]>({
    queryKey: ['insights', propertyId, limit],
    queryFn: () => AnalyticsService.fetchInsights(propertyId, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
