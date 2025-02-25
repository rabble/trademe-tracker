import { useQuery } from '@tanstack/react-query'
import { ImageService, HistoricalImage } from '../../services/image/imageService'

/**
 * Hook for fetching historical images for a property
 * 
 * @param propertyId - The property ID
 * @returns Query result with historical images and query status
 */
export function useImageHistory(propertyId: string | undefined) {
  return useQuery<HistoricalImage[]>({
    queryKey: ['imageHistory', propertyId],
    queryFn: () => ImageService.fetchImageHistory(propertyId!),
    enabled: !!propertyId, // Only run the query if a property ID is provided
  })
}
