import React from 'react';
import { FilterSection, RangeInput } from './FilterComponents';

interface PriceFilterProps {
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export function PriceFilter({ minPrice, maxPrice, onChange }: PriceFilterProps) {
  const handleMinChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onChange(numValue, maxPrice);
  };

  const handleMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onChange(minPrice, numValue);
  };

  return (
    <FilterSection title="Price Range">
      <RangeInput
        minValue={minPrice}
        maxValue={maxPrice}
        onMinChange={handleMinChange}
        onMaxChange={handleMaxChange}
        minPlaceholder="Min price"
        maxPlaceholder="Max price"
      />
    </FilterSection>
  );
}
