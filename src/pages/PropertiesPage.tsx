import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PropertyCardGrid } from '../components/property/PropertyCardGrid'
import { PropertyTable } from '../components/property/PropertyTable'
import { TableControls } from '../components/property/TableControls'
import { useProperties } from '../hooks/property/useProperties'
import { PropertyFilters as ServicePropertyFilters } from '../services/property/propertyService'
import { Property, PropertyFilters } from '../types'
import { SearchBar, FilterPanel, ActiveFilters, SavedFilters } from '../components/filter'
import { PropertyCategoryFilter } from '../components/filter/components/PropertyCategoryFilter'
import { MapView } from '../components/map/MapView'

export function PropertiesPage() {
  // Get auth state to check if user is logged in
  const { user } = useAuth()
  const isLoggedIn = !!user
  
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
          <h1 className="text-2xl font-bold text-gray-900">MiVoy Properties</h1>
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
            <PropertyCategoryFilter 
              value={filters.propertyCategory as 'all' | 'for_sale' | 'rental'} 
              onChange={(value) => setFilters(prev => ({ ...prev, propertyCategory: value }))}
            />
            
            <SearchBar 
              value={filters.searchQuery || ''} 
              onChange={handleSearch} 
              className="w-full sm:w-96"
            />
          </div>
          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <SavedFilters 
                currentFilters={filters}
                onApplyFilter={handleFilterChange}
              />
            )}
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
            {isLoggedIn ? (
              <>
                <Link
                  to="/import-property"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import URL
                </Link>
                <Link
                  to="/properties/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Property
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in to save properties
              </Link>
            )}
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
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/import-property"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import URL
              </Link>
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
