import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PropertyCardGrid } from '../components/property/PropertyCardGrid'
import { PropertyTable } from '../components/property/PropertyTable'
import { TableControls } from '../components/property/TableControls'
import { useProperties } from '../hooks/property/useProperties'
import { PropertyFilters as ServicePropertyFilters } from '../services/property/propertyService'
import { Property, PropertyFilters } from '../types'
import { SearchBar, FilterPanel, ActiveFilters, SavedFilters } from '../components/filter'
import { MapView } from '../components/map/MapView'

export function PropertiesPage() {
  // State for filters, pagination, and view mode
  const [filters, setFilters] = useState<PropertyFilters>({
    propertyCategory: 'all' // Default to 'all'
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  const [showMap, setShowMap] = useState(false)
  
  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [filters])
  
  // This effect is no longer needed since we default to 'all'

  // Convert our app filters to service filters
  const serviceFilters: ServicePropertyFilters = {
    status: filters.status?.[0],
    searchQuery: filters.searchQuery,
    bedrooms: filters.bedrooms?.[0],
    propertyCategory: filters.propertyCategory,
    // Add other filter mappings as needed
  }

  // Fetch properties with filters, pagination, and sorting
  const { 
    data: propertiesData, 
    isLoading, 
    error,
    refetch
  } = useProperties(
    serviceFilters,
    { page, limit: pageSize }
  )
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  // Helper function to map property data to PropertyCard props
  const mapPropertyToCardProps = (property: any) => {
    return {
      id: property.id,
      title: property.title,
      address: property.address,
      price: formatCurrency(property.price),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      imageUrl: property.primary_image_url || 'https://via.placeholder.com/300x200?text=No+Image',
      status: property.status,
      daysOnMarket: property.days_on_market,
      priceChange: property.last_price_change ? {
        type: property.last_price_change.new_price < property.last_price_change.old_price ? 'decrease' as const : 'increase' as const,
        amount: formatCurrency(Math.abs(property.last_price_change.new_price - property.last_price_change.old_price))
      } : undefined
    }
  }
  
  // Handle filter changes
  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters)
  }
  
  // Handle search query changes
  const handleSearch = (query: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query || undefined
    }))
  }
  
  // Calculate total pages
  const totalPages = propertiesData ? Math.ceil(propertiesData.count / pageSize) : 0
  
  // Handle sort change
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction)
    // In a real app, you would update the API call with sort parameters
    console.log(`Sorting by ${column} ${direction}`)
  }
  
  // Handle row selection
  const handleRowSelect = (property: Property) => {
    setSelectedPropertyIds(prev => {
      if (prev.includes(property.id)) {
        return prev.filter(id => id !== property.id)
      } else {
        return [...prev, property.id]
      }
    })
  }

  return (
    <div className="container-wrapper space-y-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your saved properties
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Property Category Toggle */}
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, propertyCategory: 'all' }))}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                  filters.propertyCategory === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, propertyCategory: 'for_sale' }))}
                className={`relative inline-flex items-center px-4 py-2 border-t border-b border-r border-gray-300 text-sm font-medium ${
                  filters.propertyCategory === 'for_sale' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                For Sale
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, propertyCategory: 'rental' }))}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                  filters.propertyCategory === 'rental' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Rentals
              </button>
            </div>
            
            <SearchBar 
              value={filters.searchQuery || ''} 
              onChange={handleSearch} 
              className="w-full sm:w-96"
            />
          </div>
          <div className="flex items-center space-x-2">
            <SavedFilters 
              currentFilters={filters}
              onApplyFilter={handleFilterChange}
            />
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
            <Link
              to="/properties/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Property
            </Link>
          </div>
        </div>
        
        <FilterPanel 
          filters={filters} 
          onChange={handleFilterChange} 
        />
        
        <ActiveFilters 
          filters={filters} 
          onChange={handleFilterChange} 
        />
      </div>

      {/* Map View */}
      {showMap && (
        <div className="mb-6">
          <MapView 
            properties={propertiesData?.data || []} 
            isLoading={isLoading}
            error={error as Error}
            filters={filters}
          />
        </div>
      )}
      
      {/* Table controls */}
      {propertiesData && propertiesData.data.length > 0 && (
        <TableControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1) // Reset to first page when changing page size
          }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          totalCount={propertiesData.count}
        />
      )}
      
      {/* Properties list */}
      <div className="bg-white shadow rounded-lg p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 py-8 text-center">
            Error loading properties. Please try again.
          </div>
        ) : propertiesData && propertiesData.data.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <PropertyCardGrid 
                properties={propertiesData.data.map(property => ({
                  ...mapPropertyToCardProps(property),
                  isNew: new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  onArchive: (id) => console.log(`Archive property ${id} from properties list`)
                }))}
                onArchive={(id) => console.log(`Archive property ${id}`)}
              />
            ) : (
              <PropertyTable
                properties={propertiesData.data}
                isLoading={isLoading}
                totalCount={propertiesData.count}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onRowSelect={handleRowSelect}
                selectedPropertyIds={selectedPropertyIds}
              />
            )}
          </>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
              {filters.status || filters.bedrooms || filters.searchQuery 
                ? 'Try adjusting your filters or search query.' 
                : 'Add properties to start tracking them.'}
            </p>
            <div className="mt-6">
              <Link
                to="/properties/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Property
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
