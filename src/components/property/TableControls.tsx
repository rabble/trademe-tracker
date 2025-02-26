import { useState } from 'react'

interface TableControlsProps {
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort: (column: string, direction: 'asc' | 'desc') => void
  totalCount: number
}

export function TableControls({
  viewMode,
  onViewModeChange,
  pageSize,
  onPageSizeChange,
  sortColumn,
  sortDirection,
  onSort,
  totalCount
}: TableControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const sortOptions = [
    { id: 'created_at', label: 'Date Listed' },
    { id: 'price', label: 'Price' },
    { id: 'days_on_market', label: 'Days on Market' },
    { id: 'title', label: 'Title' }
  ]
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSort(e.target.value, sortDirection || 'asc')
  }
  
  const handleDirectionChange = () => {
    if (sortColumn) {
      onSort(sortColumn, sortDirection === 'asc' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">View:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onViewModeChange('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'table'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onViewModeChange('table')}
            >
              Table
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-by" className="text-sm text-gray-500">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortColumn || 'created_at'}
              onChange={handleSortChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDirectionChange}
              className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {sortDirection === 'desc' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="page-size" className="text-sm text-gray-500">
              Show:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? 'property' : 'properties'}
          </div>
        </div>
      </div>
    </div>
  )
}
