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
  pagination?: PaginationOptions
) {
  return useQuery<{ data: Property[]; count: number }>({
    queryKey: ['properties', filters, pagination],
    queryFn: () => PropertyService.fetchProperties(filters, pagination),
  })
}
