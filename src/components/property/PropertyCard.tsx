import { useState } from 'react'
import { Link } from 'react-router-dom'

export interface PropertyCardProps {
  id: string
  title: string
  address: string
  price: string
  bedrooms?: number
  bathrooms?: number
  landArea?: string
  imageUrl?: string
  status: 'active' | 'under_offer' | 'sold' | 'archived'
  daysOnMarket: number
  priceChange?: {
    type: 'increase' | 'decrease'
    amount: string
    change_date?: string
  }
  isNew?: boolean
  statusChangeDate?: string
  createdAt?: string
  onArchive?: (id: string) => void
}

export function PropertyCard({
  id,
  title,
  address,
  price,
  bedrooms,
  bathrooms,
  landArea,
  imageUrl,
  status,
  daysOnMarket,
  priceChange,
  isNew,
  statusChangeDate,
  createdAt,
  onArchive
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [note, setNote] = useState('')
  
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>
      case 'under_offer':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Under Offer</span>
      case 'sold':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Sold</span>
      case 'archived':
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Archived</span>
    }
  }
  
  const getPriceChangeIndicator = () => {
    if (!priceChange) return null
    
    return priceChange.type === 'decrease' ? (
      <span className="text-green-600 text-sm font-medium flex items-center">
        ↓ {priceChange.amount}
      </span>
    ) : (
      <span className="text-red-600 text-sm font-medium flex items-center">
        ↑ {priceChange.amount}
      </span>
    )
  }
  
  const handleSaveNote = () => {
    // In a real app, this would save the note to the database
    console.log(`Saving note for property ${id}: ${note}`)
    setShowNotes(false)
  }
  
  const handleArchive = () => {
    if (onArchive) {
      onArchive(id)
    }
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg
        ${isNew ? 'ring-2 ring-blue-500' : ''}
        ${status === 'under_offer' ? 'border-l-4 border-yellow-400' : ''}
        ${status === 'sold' ? 'border-l-4 border-red-400' : ''}
        ${priceChange?.type === 'decrease' ? 'border-t-4 border-green-400' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isNew && (
        <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 absolute top-0 left-0 z-10">
          NEW
        </div>
      )}
      
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
        
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            {bedrooms !== undefined && (
              <span className="mr-3">{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
            )}
            {bathrooms !== undefined && (
              <span className="mr-3">{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
            )}
            {landArea && (
              <span>{landArea}</span>
            )}
          </div>
          <div className={daysOnMarket < 14 ? 'text-green-600 font-medium' : ''}>
            {daysOnMarket} days on market
          </div>
        </div>
      </div>
      
      {showNotes ? (
        <div className="p-3 border-t border-gray-100">
          <textarea
            className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
            rows={2}
            placeholder="Add your notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button 
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
              onClick={() => setShowNotes(false)}
            >
              Cancel
            </button>
            <button 
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
              onClick={handleSaveNote}
            >
              Save
            </button>
          </div>
        </div>
      ) : isHovered && (
        <div className="bg-gray-50 p-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link 
              to={`/properties/${id}`}
              className="flex-1 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
            >
              View Details
            </Link>
            <button 
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              onClick={() => setShowNotes(true)}
            >
              Notes
            </button>
            <button 
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              onClick={handleArchive}
            >
              Archive
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton loading state for PropertyCard
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  )
}
