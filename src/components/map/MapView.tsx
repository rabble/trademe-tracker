import React, { useState, useEffect, useRef } from 'react'
import { Property } from '../../types'
import { PropertyMapCard } from './PropertyMapCard'

// Placeholder for map functionality

interface MapViewProps {
  properties: Property[]
  isLoading?: boolean
  error?: Error | null
  filters?: Record<string, any>
}

export function MapView({ properties, isLoading, error }: MapViewProps) {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street')
  const mapRef = useRef<HTMLDivElement>(null)
  
  // In a real implementation, we would initialize the map here
  useEffect(() => {
    // This would be where we'd initialize the map with the Leaflet library
    // For now, we'll just show a placeholder
  }, [])

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading map data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || 'An unknown error occurred'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" style={{backgroundColor: '#fff0f5'}}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Property Map</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMapType('street')}
            className={`px-3 py-1 text-sm rounded-md ${
              mapType === 'street' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1 text-sm rounded-md ${
              mapType === 'satellite' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>
      
      <div className="h-[600px] relative bg-gray-100" ref={mapRef}>
        {isLoading ? (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center p-8 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Map Visualization</h3>
              <p className="text-gray-600 mb-4">
                {properties.length > 0 
                  ? `Showing ${properties.length} properties on the map.` 
                  : 'No properties to display on the map.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {properties.slice(0, 2).map(property => (
                  <div key={property.id} className="bg-white p-3 rounded-md shadow-sm">
                    <PropertyMapCard property={property} />
                  </div>
                ))}
              </div>
              {properties.length > 2 && (
                <p className="text-sm text-gray-500 mt-4">
                  And {properties.length - 2} more properties...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
