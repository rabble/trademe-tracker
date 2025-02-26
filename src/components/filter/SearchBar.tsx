import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search properties...', className = '' }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce the onChange callback
  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      onChange(value);
    }, 300),
    [onChange]
  );

  // Update local state and trigger debounced onChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    debouncedOnChange(newValue);
  };

  // Clear the search
  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  // Update local state when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        className="block w-full p-2 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={placeholder}
      />
      {searchTerm && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          onClick={handleClear}
        >
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}
