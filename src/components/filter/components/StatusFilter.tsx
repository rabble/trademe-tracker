import React from 'react';
import { FilterSection, CheckboxGroup } from './FilterComponents';

interface StatusFilterProps {
  selectedStatuses: Array<'active' | 'under_offer' | 'sold' | 'archived'> | undefined;
  onChange: (statuses: Array<'active' | 'under_offer' | 'sold' | 'archived'>) => void;
}

export function StatusFilter({ selectedStatuses = [], onChange }: StatusFilterProps) {
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'under_offer', label: 'Under Offer' },
    { value: 'sold', label: 'Sold' },
    { value: 'archived', label: 'Archived' }
  ];

  const handleChange = (status: string, checked: boolean) => {
    const currentStatuses = selectedStatuses || [];
    const newStatuses = checked 
      ? [...currentStatuses, status as any] 
      : currentStatuses.filter(s => s !== status);
    
    onChange(newStatuses);
  };

  return (
    <FilterSection title="Status">
      <CheckboxGroup
        options={statusOptions}
        selectedValues={selectedStatuses}
        onChange={handleChange}
      />
    </FilterSection>
  );
}
