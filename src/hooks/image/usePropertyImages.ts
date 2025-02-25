import { useQuery } from '@tanstack/react-query'
import { ImageService, PropertyImage } from '../../services/image/imageService'

/**
 * Hook for fetching all images for a property
 * 
 * @param propertyId - The property ID
 * @returns Query result with property images and query status
 */
export function usePropertyImages(propertyId: string | undefined) {
  return useQuery<PropertyImage[]>({
    queryKey: ['propertyImages', propertyId],
    queryFn: () => ImageService.fetchPropertyImages(propertyId!),
    enabled: !!propertyId, // Only run the query if a property ID is provided
  })
}
