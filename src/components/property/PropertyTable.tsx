import { useState, useMemo } from 'react'
import { Property } from '../../types'
import { formatCurrency } from '../../utils/formatters'

// Define column configuration type
export interface ColumnConfig {
  id: string
  header: string
  accessor: (property: Property) => React.ReactNode
  sortable?: boolean
  width?: string
  minWidth?: string
  className?: string
}

// Define property table props
export interface PropertyTableProps {
  properties: Property[]
  isLoading?: boolean
  totalCount: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSort: (columnId: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onRowSelect?: (property: Property) => void
  selectedPropertyIds?: string[]
}

export function PropertyTable({
  properties,
  isLoading = false,
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortColumn,
  sortDirection,
  onRowSelect,
  selectedPropertyIds = []
}: PropertyTableProps) {
  // State for column resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, string>>({})
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState<number>(0)
  const [initialWidth, setInitialWidth] = useState<number>(0)

  // Define table columns
  const columns: ColumnConfig[] = useMemo(() => [
    {
      id: 'image',
      header: '',
      accessor: (property) => (
        <div className="w-16 h-12 overflow-hidden rounded">
          <img 
            src={property.primary_image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
      ),
      width: '80px',
      minWidth: '80px',
      sortable: false
    },
    {
      id: 'title',
      header: 'Property',
      accessor: (property) => (
        <div>
          <div className="font-medium text-gray-900">{property.title}</div>
          <div className="text-sm text-gray-500">{property.address}</div>
        </div>
      ),
      width: '25%',
      minWidth: '200px',
      sortable: true
    },
    {
      id: 'details',
      header: 'Details',
      accessor: (property) => (
        <div className="text-sm">
          {property.bedrooms && <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} • </span>}
          {property.bathrooms && <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>}
        </div>
      ),
      width: '15%',
      minWidth: '120px',
      sortable: false
    },
    {
      id: 'price',
      header: 'Price',
      accessor: (property) => {
        const formattedPrice = formatCurrency(property.price)
        const priceChange = property.last_price_change
        
        return (
          <div>
            <div className="font-medium">{formattedPrice}</div>
            {priceChange && (
              <div className={`text-sm ${priceChange.new_price < priceChange.old_price ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange.new_price < priceChange.old_price ? '↓ ' : '↑ '}
                {formatCurrency(Math.abs(priceChange.new_price - priceChange.old_price))}
              </div>
            )}
          </div>
        )
      },
      width: '15%',
      minWidth: '120px',
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (property) => {
        let statusClass = ''
        switch (property.status) {
          case 'active':
            statusClass = 'bg-green-100 text-green-800'
            break
          case 'under_offer':
            statusClass = 'bg-yellow-100 text-yellow-800'
            break
          case 'sold':
            statusClass = 'bg-red-100 text-red-800'
            break
          case 'archived':
            statusClass = 'bg-gray-100 text-gray-800'
            break
        }
        
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${statusClass}`}>
            {property.status.replace('_', ' ')}
          </span>
        )
      },
      width: '15%',
      minWidth: '120px',
      sortable: true
    },
    {
      id: 'days_on_market',
      header: 'Days on Market',
      accessor: (property) => (
        <div className={property.days_on_market < 14 ? 'text-green-600 font-medium' : ''}>
          {property.days_on_market}
        </div>
      ),
      width: '15%',
      minWidth: '120px',
      sortable: true
    },
    {
      id: 'created_at',
      header: 'Listed',
      accessor: (property) => {
        const date = new Date(property.created_at)
        const isNew = new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        
        return (
          <div className="flex items-center">
            <div>{date.toLocaleDateString()}</div>
            {isNew && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                NEW
              </span>
            )}
          </div>
        )
      },
      width: '15%',
      minWidth: '120px',
      sortable: true
    }
  ], [])

  // Handle column resize start
  const handleResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: string) => {
    e.preventDefault()
    setResizingColumn(columnId)
    setResizeStartX(e.clientX)
    
    // Get current width in pixels
    const numericWidth = parseInt(currentWidth.replace('px', ''))
    setInitialWidth(numericWidth || 100) // Default to 100px if parsing fails
    
    // Add event listeners for mousemove and mouseup
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  // Handle column resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingColumn) return
    
    const deltaX = e.clientX - resizeStartX
    const newWidth = Math.max(100, initialWidth + deltaX) // Ensure minimum width of 100px
    
    setColumnWidths({
      ...columnWidths,
      [resizingColumn]: `${newWidth}px`
    })
  }

  // Handle column resize end
  const handleResizeEnd = () => {
    setResizingColumn(null)
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  // Handle sort click
  const handleSortClick = (columnId: string) => {
    if (sortColumn === columnId) {
      // Toggle direction if already sorting by this column
      onSort(columnId, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Default to ascending for new sort column
      onSort(columnId, 'asc')
    }
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize)

  // Handle row selection
  const handleRowClick = (property: Property) => {
    if (onRowSelect) {
      onRowSelect(property)
    }
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th 
                    key={column.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map(column => (
                    <td key={column.id} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th 
                  key={column.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                  style={{ 
                    width: columnWidths[column.id] || column.width,
                    minWidth: column.minWidth
                  }}
                >
                  <div className="flex items-center">
                    {column.sortable ? (
                      <button 
                        className="group flex items-center space-x-1 focus:outline-none"
                        onClick={() => handleSortClick(column.id)}
                      >
                        <span>{column.header}</span>
                        <span className={`inline-flex flex-col ${sortColumn === column.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                          <svg className={`h-2 w-2 ${sortColumn === column.id && sortDirection === 'asc' ? 'text-indigo-600' : ''}`} viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z" />
                          </svg>
                          <svg className={`h-2 w-2 ${sortColumn === column.id && sortDirection === 'desc' ? 'text-indigo-600' : ''}`} viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z" />
                          </svg>
                        </span>
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </div>
                  
                  {/* Resizable handle */}
                  <div 
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize flex items-center justify-center group"
                    onMouseDown={(e) => handleResizeStart(e, column.id, columnWidths[column.id] || column.width || '100px')}
                  >
                    <div className="h-4/5 w-0.5 bg-gray-300 group-hover:bg-indigo-500"></div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map(property => {
              const isSelected = selectedPropertyIds.includes(property.id)
              const isNew = new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              
              return (
                <tr 
                  key={property.id} 
                  className={`
                    hover:bg-gray-50 cursor-pointer
                    ${isSelected ? 'bg-indigo-50' : ''}
                    ${isNew ? 'border-l-4 border-blue-400' : ''}
                  `}
                  onClick={() => handleRowClick(property)}
                >
                  {columns.map(column => (
                    <td 
                      key={column.id} 
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.accessor(property)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number
                
                // Show pages around current page
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
