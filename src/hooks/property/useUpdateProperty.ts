import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PropertyService } from '../../services/property/propertyService'
import { Property } from '../../types'

/**
 * Hook for updating a property
 * 
 * @returns Mutation result with update function and mutation status
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) => 
      PropertyService.updateProperty(id, data),
    onSuccess: (updatedProperty) => {
      // Invalidate the specific property query
      queryClient.invalidateQueries({ queryKey: ['property', updatedProperty.id] })
      
      // Update the property in the properties list cache
      queryClient.setQueryData<{ data: Property[]; count: number } | undefined>(
        ['properties'],
        (oldData) => {
          if (!oldData) return undefined
          
          return {
            ...oldData,
            data: oldData.data.map(property => 
              property.id === updatedProperty.id ? updatedProperty : property
            )
          }
        }
      )
    }
  })
}
