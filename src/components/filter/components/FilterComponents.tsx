import React from 'react';

/**
 * Generic filter section component with title and content
 */
export function FilterSection({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode 
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Generic range input component for numeric filters
 */
export function RangeInput({ 
  minValue, 
  maxValue, 
  onMinChange, 
  onMaxChange, 
  minPlaceholder = "Min", 
  maxPlaceholder = "Max",
  min = "0"
}: { 
  minValue: number | string | undefined; 
  maxValue: number | string | undefined; 
  onMinChange: (value: string) => void; 
  onMaxChange: (value: string) => void; 
  minPlaceholder?: string;
  maxPlaceholder?: string;
  min?: string;
}) {
  return (
    <div className="flex space-x-2">
      <div className="w-1/2">
        <input
          type="number"
          value={minValue || ''}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
          placeholder={minPlaceholder}
          min={min}
        />
      </div>
      <div className="w-1/2">
        <input
          type="number"
          value={maxValue || ''}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded"
          placeholder={maxPlaceholder}
          min={min}
        />
      </div>
    </div>
  );
}

/**
 * Generic checkbox group component for multiple selection filters
 */
export function CheckboxGroup({ 
  options, 
  selectedValues, 
  onChange,
  columns = 2
}: { 
  options: Array<{value: string; label: string}>; 
  selectedValues: string[] | undefined; 
  onChange: (value: string, checked: boolean) => void;
  columns?: number;
}) {
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center">
          <input
            type="checkbox"
            checked={selectedValues?.includes(option.value) || false}
            onChange={(e) => onChange(option.value, e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <span className="ml-2 text-sm text-gray-700 capitalize">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
