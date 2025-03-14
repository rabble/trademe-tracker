import React from 'react';

interface PropertyCategoryFilterProps {
  value: 'all' | 'for_sale' | 'rental';
  onChange: (value: 'all' | 'for_sale' | 'rental') => void;
  className?: string;
}

export function PropertyCategoryFilter({ value, onChange, className = '' }: PropertyCategoryFilterProps) {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
          value === 'all' 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        All
      </button>
      <button
        type="button"
        onClick={() => onChange('for_sale')}
        className={`relative inline-flex items-center px-4 py-2 border-t border-b border-r border-gray-300 text-sm font-medium ${
          value === 'for_sale' 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        For Sale
      </button>
      <button
        type="button"
        onClick={() => onChange('rental')}
        className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
          value === 'rental' 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Rentals
      </button>
    </div>
  );
}
