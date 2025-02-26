import React from 'react';
import { PropertySummaryStats } from './PropertySummaryStats';
import { PriceHistoryChart } from './PriceHistoryChart';
import { StatusDistributionChart } from './StatusDistributionChart';
import { PropertyTypesChart } from './PropertyTypesChart';
import { TimeOnMarketChart } from './TimeOnMarketChart';

interface AnalyticsDashboardProps {
  isLoading?: boolean;
  error?: Error | null;
}

export function AnalyticsDashboard({ isLoading = false, error = null }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      
      <PropertySummaryStats />
      
      <div className="grid grid-cols-1 gap-6">
        <PriceHistoryChart isLoading={isLoading} error={error} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusDistributionChart isLoading={isLoading} error={error} />
        <PropertyTypesChart isLoading={isLoading} error={error} />
        <TimeOnMarketChart isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
