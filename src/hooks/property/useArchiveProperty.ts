import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PropertyService } from '../../services/property/propertyService'
import { Property } from '../../types'

/**
 * Hook for archiving a property
 * 
 * @returns Mutation result with archive function and mutation status
 */
export function useArchiveProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => PropertyService.archiveProperty(id),
    onSuccess: (archivedProperty) => {
      // Invalidate the specific property query
      queryClient.invalidateQueries({ queryKey: ['property', archivedProperty.id] })
      
      // Update the properties list cache to remove the archived property
      queryClient.setQueryData<{ data: Property[]; count: number } | undefined>(
        ['properties'],
        (oldData) => {
          if (!oldData) return undefined
          
          return {
            ...oldData,
            data: oldData.data.filter(property => property.id !== archivedProperty.id),
            count: oldData.count - 1
          }
        }
      )
      
      // Invalidate the summary query
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    }
  })
}
