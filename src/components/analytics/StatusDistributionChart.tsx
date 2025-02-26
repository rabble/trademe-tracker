import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectItem } from '../ui/select';

// Mock data - in a real app, this would come from an API
const mockData = {
  all: [
    { name: 'Active', value: 65, color: '#4ade80' },
    { name: 'Under Offer', value: 15, color: '#facc15' },
    { name: 'Sold', value: 20, color: '#3b82f6' },
  ],
  house: [
    { name: 'Active', value: 60, color: '#4ade80' },
    { name: 'Under Offer', value: 20, color: '#facc15' },
    { name: 'Sold', value: 20, color: '#3b82f6' },
  ],
  apartment: [
    { name: 'Active', value: 70, color: '#4ade80' },
    { name: 'Under Offer', value: 10, color: '#facc15' },
    { name: 'Sold', value: 20, color: '#3b82f6' },
  ],
  townhouse: [
    { name: 'Active', value: 65, color: '#4ade80' },
    { name: 'Under Offer', value: 15, color: '#facc15' },
    { name: 'Sold', value: 20, color: '#3b82f6' },
  ],
};

interface StatusDistributionChartProps {
  isLoading?: boolean;
  error?: Error | null;
}

export function StatusDistributionChart({ isLoading = false, error = null }: StatusDistributionChartProps) {
  const [propertyType, setPropertyType] = useState('all');
  
  const data = mockData[propertyType as keyof typeof mockData];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80 animate-pulse bg-gray-100"></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">Failed to load status distribution data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Status Distribution</CardTitle>
        <Select 
          value={propertyType} 
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-[180px]"
        >
          <SelectItem value="all">All Properties</SelectItem>
          <SelectItem value="house">Houses</SelectItem>
          <SelectItem value="apartment">Apartments</SelectItem>
          <SelectItem value="townhouse">Townhouses</SelectItem>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
