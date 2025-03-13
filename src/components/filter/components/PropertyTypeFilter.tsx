import React from 'react';
import { FilterSection, CheckboxGroup } from './FilterComponents';

interface PropertyTypeFilterProps {
  selectedTypes: Array<'house' | 'apartment' | 'townhouse' | 'section' | 'other'> | undefined;
  onChange: (types: Array<'house' | 'apartment' | 'townhouse' | 'section' | 'other'>) => void;
}

export function PropertyTypeFilter({ selectedTypes = [], onChange }: PropertyTypeFilterProps) {
  const propertyTypeOptions = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'section', label: 'Section' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (type: string, checked: boolean) => {
    const currentTypes = selectedTypes || [];
    const newTypes = checked 
      ? [...currentTypes, type as any] 
      : currentTypes.filter(t => t !== type);
    
    onChange(newTypes);
  };

  return (
    <FilterSection title="Property Type">
      <CheckboxGroup
        options={propertyTypeOptions}
        selectedValues={selectedTypes}
        onChange={handleChange}
      />
    </FilterSection>
  );
}
