import { useQuery } from '@tanstack/react-query'
import { PropertyService } from '../../services/property/propertyService'
import { Property } from '../../types'

/**
 * Hook for fetching a single property by ID
 * 
 * @param id - The property ID
 * @returns Query result with property data and query status
 */
export function useProperty(id: string | undefined) {
  return useQuery<Property>({
    queryKey: ['property', id],
    queryFn: () => PropertyService.fetchPropertyById(id!),
    enabled: !!id, // Only run the query if an ID is provided
  })
}
