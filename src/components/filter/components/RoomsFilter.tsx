import React from 'react';
import { FilterSection, RangeInput } from './FilterComponents';

interface RoomsFilterProps {
  type: 'bedrooms' | 'bathrooms';
  minValue: number | undefined;
  maxValue: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export function RoomsFilter({ type, minValue, maxValue, onChange }: RoomsFilterProps) {
  const title = type === 'bedrooms' ? 'Bedrooms' : 'Bathrooms';

  const handleMinChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onChange(numValue, maxValue);
  };

  const handleMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onChange(minValue, numValue);
  };

  return (
    <FilterSection title={title}>
      <RangeInput
        minValue={minValue}
        maxValue={maxValue}
        onMinChange={handleMinChange}
        onMaxChange={handleMaxChange}
        minPlaceholder="Min"
        maxPlaceholder="Max"
        min="0"
      />
    </FilterSection>
  );
}
