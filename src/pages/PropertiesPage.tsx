import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PropertyCardGrid } from '../components/property/PropertyCardGrid'
import { PropertyTable } from '../components/property/PropertyTable'
import { TableControls } from '../components/property/TableControls'
import { useProperties } from '../hooks/property/useProperties'
import { PropertyFilters } from '../services/property/propertyService'
import { Property } from '../types'

export function PropertiesPage() {
  // State for filters, pagination, and view mode
  const [filters, setFilters] = useState<PropertyFilters>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  
  // Fetch properties with filters, pagination, and sorting
  const { 
    data: propertiesData, 
    isLoading, 
    error,
    refetch
  } = useProperties(
    { ...filters, searchQuery: searchQuery || undefined },
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
  const handleFilterChange = (newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
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
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Properties</h2>
          
          <Link
            to="/properties/add"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Property
          </Link>
        </div>
        
        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Search
              </button>
            </form>
          </div>
          
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="under_offer">Under Offer</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => handleFilterChange({ bedrooms: parseInt(e.target.value) || undefined })}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">All Bedrooms</option>
              <option value="1">1+ Bedroom</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>
        </div>
      </div>
      
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
              {filters.status || filters.bedrooms || searchQuery 
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
