import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useSummary } from '../../hooks/analytics/useSummary';
import { formatCurrency } from '../../utils/formatters';

export function PropertySummaryStats() {
  const { data: summary, isLoading, error } = useSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">Failed to load summary statistics</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Properties',
      value: summary.totalProperties,
      description: 'Properties being tracked',
      trend: null,
    },
    {
      title: 'Active Properties',
      value: summary.activeProperties,
      description: `${Math.round((summary.activeProperties / summary.totalProperties) * 100)}% of total`,
      trend: null,
    },
    {
      title: 'Average Price',
      value: formatCurrency(summary.averagePrice),
      description: 'Across all properties',
      trend: null,
    },
    {
      title: 'Avg. Days on Market',
      value: Math.round(summary.averageDaysOnMarket),
      description: 'For active properties',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
