import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../utils/formatters';

// Mock data - in a real app, this would come from an API
const mockData = [
  { name: 'House', count: 45, avgPrice: 950000 },
  { name: 'Apartment', count: 30, avgPrice: 650000 },
  { name: 'Townhouse', count: 15, avgPrice: 750000 },
  { name: 'Section', count: 8, avgPrice: 450000 },
  { name: 'Other', count: 2, avgPrice: 550000 },
];

interface PropertyTypesChartProps {
  isLoading?: boolean;
  error?: Error | null;
}

export function PropertyTypesChart({ isLoading = false, error = null }: PropertyTypesChartProps) {
  const [metric, setMetric] = useState<'count' | 'avgPrice'>('count');
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Types</CardTitle>
        </CardHeader>
        <CardContent className="h-80 animate-pulse bg-gray-100"></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">Failed to load property types data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatYAxis = (value: number): string => {
    if (metric === 'avgPrice') {
      return formatCurrency(value, true);
    }
    return value.toString();
  };

  const formatTooltip = (value: number): string => {
    if (metric === 'avgPrice') {
      return formatCurrency(value);
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Property Types</CardTitle>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
          <Button
            variant={metric === 'count' ? "default" : "ghost"}
            size="sm"
            onClick={() => setMetric('count')}
            className="text-xs h-7"
          >
            Count
          </Button>
          <Button
            variant={metric === 'avgPrice' ? "default" : "ghost"}
            size="sm"
            onClick={() => setMetric('avgPrice')}
            className="text-xs h-7"
          >
            Avg. Price
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar 
                dataKey={metric} 
                name={metric === 'count' ? 'Number of Properties' : 'Average Price'} 
                fill={metric === 'count' ? '#8884d8' : '#82ca9d'} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
