import React from 'react';
import { FilterSection, RangeInput } from './FilterComponents';

interface DaysOnMarketFilterProps {
  minDays: number | undefined;
  maxDays: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export function DaysOnMarketFilter({ minDays, maxDays, onChange }: DaysOnMarketFilterProps) {
  const handleMinChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onChange(numValue, maxDays);
  };

  const handleMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onChange(minDays, numValue);
  };

  return (
    <FilterSection title="Days on Market">
      <RangeInput
        minValue={minDays}
        maxValue={maxDays}
        onMinChange={handleMinChange}
        onMaxChange={handleMaxChange}
        minPlaceholder="Min days"
        maxPlaceholder="Max days"
        min="0"
      />
    </FilterSection>
  );
}
