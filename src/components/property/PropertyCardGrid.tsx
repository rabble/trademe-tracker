import { PropertyCard, PropertyCardProps, PropertyCardSkeleton } from './PropertyCard'

interface PropertyCardGridProps {
  properties: PropertyCardProps[]
  isLoading?: boolean
  skeletonCount?: number
  onArchive?: (id: string) => void
}

export function PropertyCardGrid({ 
  properties, 
  isLoading = false, 
  skeletonCount = 6,
  onArchive
}: PropertyCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or add new properties.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <PropertyCard 
          key={property.id} 
          {...property} 
          onArchive={onArchive}
        />
      ))}
    </div>
  )
}
