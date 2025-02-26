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
import { Select, SelectItem } from '../ui/select';

// Mock data - in a real app, this would come from an API
const mockData = {
  all: [
    { range: '0-30', count: 25 },
    { range: '31-60', count: 35 },
    { range: '61-90', count: 20 },
    { range: '91-120', count: 10 },
    { range: '120+', count: 10 },
  ],
  house: [
    { range: '0-30', count: 20 },
    { range: '31-60', count: 30 },
    { range: '61-90', count: 25 },
    { range: '91-120', count: 15 },
    { range: '120+', count: 10 },
  ],
  apartment: [
    { range: '0-30', count: 30 },
    { range: '31-60', count: 40 },
    { range: '61-90', count: 15 },
    { range: '91-120', count: 10 },
    { range: '120+', count: 5 },
  ],
  region: {
    auckland: [
      { range: '0-30', count: 30 },
      { range: '31-60', count: 35 },
      { range: '61-90', count: 20 },
      { range: '91-120', count: 10 },
      { range: '120+', count: 5 },
    ],
    wellington: [
      { range: '0-30', count: 20 },
      { range: '31-60', count: 30 },
      { range: '61-90', count: 25 },
      { range: '91-120', count: 15 },
      { range: '120+', count: 10 },
    ],
    christchurch: [
      { range: '0-30', count: 25 },
      { range: '31-60', count: 35 },
      { range: '61-90', count: 20 },
      { range: '91-120', count: 10 },
      { range: '120+', count: 10 },
    ],
  },
};

interface TimeOnMarketChartProps {
  isLoading?: boolean;
  error?: Error | null;
}

export function TimeOnMarketChart({ isLoading = false, error = null }: TimeOnMarketChartProps) {
  const [filterType, setFilterType] = useState('property');
  const [propertyType, setPropertyType] = useState('all');
  const [region, setRegion] = useState('auckland');
  
  let data;
  if (filterType === 'property') {
    data = mockData[propertyType as 'all' | 'house' | 'apartment'];
  } else {
    data = mockData.region[region as 'auckland' | 'wellington' | 'christchurch'];
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time on Market</CardTitle>
        </CardHeader>
        <CardContent className="h-80 animate-pulse bg-gray-100"></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time on Market</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">Failed to load time on market data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time on Market</CardTitle>
        <div className="flex space-x-2">
          <Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="w-[120px]"
          >
            <SelectItem value="property">Property Type</SelectItem>
            <SelectItem value="region">Region</SelectItem>
          </Select>
          
          {filterType === 'property' ? (
            <Select 
              value={propertyType} 
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-[150px]"
            >
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="apartment">Apartments</SelectItem>
            </Select>
          ) : (
            <Select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              className="w-[150px]"
            >
              <SelectItem value="auckland">Auckland</SelectItem>
              <SelectItem value="wellington">Wellington</SelectItem>
              <SelectItem value="christchurch">Christchurch</SelectItem>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" label={{ value: 'Days on Market', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Number of Properties', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Properties" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
