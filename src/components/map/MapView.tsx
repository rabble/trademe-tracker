import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Icon, LatLngExpression } from 'leaflet'
import { Property } from '../../types'
import { PropertyMapCard } from './PropertyMapCard'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Fix for default marker icons in Leaflet with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Define custom icons for different property types
const defaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const soldIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const underOfferIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Helper component to recenter map
function RecenterControl({ position }: { position: LatLngExpression }) {
  const map = useMap()
  
  const handleClick = () => {
    map.setView(position, 12)
  }
  
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleClick() }}
          title="Recenter map"
          className="flex items-center justify-center w-8 h-8 bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  )
}

interface MapViewProps {
  properties: Property[]
  isLoading?: boolean
  error?: Error | null
  filters?: Record<string, any>
}

export function MapView({ properties, isLoading, error }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([-41.2865, 174.7762]) // Default to Wellington, NZ
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street')
  
  // Calculate center based on properties
  useEffect(() => {
    if (properties.length > 0) {
      // In a real app, we would calculate the center based on property coordinates
      // For now, we'll use a default center
      const hasCoordinates = properties.some(p => p.latitude && p.longitude)
      if (hasCoordinates) {
        // Find average lat/lng
        const validProperties = properties.filter(p => p.latitude && p.longitude)
        const avgLat = validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0) / validProperties.length
        const avgLng = validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0) / validProperties.length
        setMapCenter([avgLat, avgLng])
      }
    }
  }, [properties])

  // Helper to get icon based on property status
  const getPropertyIcon = (status: string) => {
    switch (status) {
      case 'sold':
        return soldIcon
      case 'under_offer':
        return underOfferIcon
      default:
        return defaultIcon
    }
  }

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Property Map</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMapLayer('street')}
            className={`px-3 py-1 text-sm rounded-md ${
              mapLayer === 'street' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1 text-sm rounded-md ${
              mapLayer === 'satellite' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>
      
      <div className="h-[600px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        <MapContainer 
          center={mapCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Map Layers */}
          {mapLayer === 'street' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {mapLayer === 'satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          {/* Controls */}
          <ZoomControl position="topright" />
          <RecenterControl position={mapCenter} />
          
          {/* Property Markers */}
          <MarkerClusterGroup>
            {properties.map(property => {
              // In a real app, we would use actual coordinates from the property
              // For demo purposes, we'll generate random coordinates around the center
              const lat = (property.latitude || 
                (Array.isArray(mapCenter) ? mapCenter[0] : -41.2865)) + 
                (Math.random() - 0.5) * 0.05
              const lng = (property.longitude || 
                (Array.isArray(mapCenter) ? mapCenter[1] : 174.7762)) + 
                (Math.random() - 0.5) * 0.05
              
              return (
                <Marker 
                  key={property.id} 
                  position={[lat, lng]}
                  icon={getPropertyIcon(property.status)}
                >
                  <Popup>
                    <PropertyMapCard property={property} />
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  )
}
