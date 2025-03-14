import { useQuery } from '@tanstack/react-query'
import { PropertyService, PropertyFilters, PaginationOptions } from '../../services/property/propertyService'
import { Property } from '../../types'

/**
 * Hook for fetching properties with optional filtering and pagination
 * 
 * @param filters - Optional filters to apply to the query
 * @param pagination - Optional pagination options
 * @returns Query result with properties data, count, and query status
 */
export function useProperties(
  filters?: PropertyFilters,
  pagination?: PaginationOptions,
  useTrademe: boolean = false
) {
  // Log the filters being used
  console.log('useProperties hook called with filters:', filters);
  
  return useQuery<{ data: Property[]; count: number }>({
    queryKey: ['properties', filters, pagination, useTrademe],
    queryFn: () => PropertyService.fetchProperties(filters, pagination, useTrademe),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
