import React from 'react'
import { Link } from 'react-router-dom'
import { Property } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface PropertyMapCardProps {
  property: Property
}

export function PropertyMapCard({ property }: PropertyMapCardProps) {
  return (
    <div className="w-64 p-2">
      <div className="flex flex-col">
        <div className="relative h-32 mb-2">
          <img 
            src={property.primary_image_url || '/images/4561711536_8a13c526fc_o.jpg'} 
            alt={property.title}
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute top-0 right-0 m-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 uppercase">
            {property.status.replace('_', ' ')}
          </div>
        </div>
        <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
        <p className="text-gray-600 text-sm truncate">{property.address}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-indigo-600">{formatCurrency(property.price)}</span>
          <Link 
            to={`/properties/${property.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
