import { useState } from 'react'

interface PropertyCardProps {
  id: string
  title: string
  address: string
  price: string
  bedrooms?: number
  bathrooms?: number
  imageUrl?: string
  status: 'active' | 'under_offer' | 'sold'
  daysOnMarket: number
  priceChange?: {
    type: 'increase' | 'decrease'
    amount: string
  }
}

export function PropertyCard({
  id,
  title,
  address,
  price,
  bedrooms,
  bathrooms,
  imageUrl,
  status,
  daysOnMarket,
  priceChange
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>
      case 'under_offer':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Under Offer</span>
      case 'sold':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Sold</span>
    }
  }
  
  const getPriceChangeIndicator = () => {
    if (!priceChange) return null
    
    return priceChange.type === 'decrease' ? (
      <span className="text-green-600 text-sm font-medium flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        {priceChange.amount}
      </span>
    ) : (
      <span className="text-red-600 text-sm font-medium flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        {priceChange.amount}
      </span>
    )
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{address}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="font-bold text-lg">{price}</div>
          {getPriceChangeIndicator()}
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center">
            {bedrooms !== undefined && (
              <span className="mr-3">{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
            )}
            {bathrooms !== undefined && (
              <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div>{daysOnMarket} days on market</div>
        </div>
      </div>
      
      {isHovered && (
        <div className="bg-gray-50 p-3 border-t border-gray-100">
          <button 
            className="w-full py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
            onClick={() => console.log(`View property ${id}`)}
          >
            View Details
          </button>
        </div>
      )}
    </div>
  )
}
