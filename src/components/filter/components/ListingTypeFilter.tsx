import React from 'react';
import { FilterSection, CheckboxGroup } from './FilterComponents';

interface ListingTypeFilterProps {
  selectedTypes: Array<'auction' | 'price_by_negotiation' | 'asking_price' | 'tender' | 'enquiries_over'> | undefined;
  onChange: (types: Array<'auction' | 'price_by_negotiation' | 'asking_price' | 'tender' | 'enquiries_over'>) => void;
}

export function ListingTypeFilter({ selectedTypes = [], onChange }: ListingTypeFilterProps) {
  const listingTypeOptions = [
    { value: 'auction', label: 'Auction' },
    { value: 'price_by_negotiation', label: 'Price by Negotiation' },
    { value: 'asking_price', label: 'Asking Price' },
    { value: 'tender', label: 'Tender' },
    { value: 'enquiries_over', label: 'Enquiries Over' }
  ];

  const handleChange = (type: string, checked: boolean) => {
    const currentTypes = selectedTypes || [];
    const newTypes = checked 
      ? [...currentTypes, type as any] 
      : currentTypes.filter(t => t !== type);
    
    onChange(newTypes);
  };

  return (
    <FilterSection title="Listing Type">
      <CheckboxGroup
        options={listingTypeOptions}
        selectedValues={selectedTypes}
        onChange={handleChange}
      />
    </FilterSection>
  );
}
