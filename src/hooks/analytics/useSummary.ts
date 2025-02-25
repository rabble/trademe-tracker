import { useQuery } from '@tanstack/react-query'
import { AnalyticsService, PortfolioSummary } from '../../services/analytics/analyticsService'

/**
 * Hook for fetching summary statistics for the property portfolio
 * 
 * @returns Query result with portfolio summary and query status
 */
export function useSummary() {
  return useQuery<PortfolioSummary>({
    queryKey: ['summary'],
    queryFn: () => AnalyticsService.fetchSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
