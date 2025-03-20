import { PropertyCard, PropertyCardProps } from './PropertyCard'

interface PropertyCarouselProps {
  properties: PropertyCardProps[]
  title?: string
}

export function PropertyCarousel({ 
  properties,
  title
}: PropertyCarouselProps) {
  return (
    <div className="py-6">
      {title && (
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      <div className="relative">
        <div className="flex overflow-x-auto pb-6 pt-1 gap-4 scrollbar-hide snap-x snap-mandatory">
          {properties.map(property => (
            <div key={property.id} className="min-w-[280px] w-72 flex-shrink-0 snap-start">
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
        
        {properties.length > 3 && (
          <>
            {/* Shadow indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
          </>
        )}
      </div>
    </div>
  )
}