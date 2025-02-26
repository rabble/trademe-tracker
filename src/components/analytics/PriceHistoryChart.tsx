import React, { useState } from 'react';
import {
  LineChart,
  Line,
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
const generateMockData = (period: string) => {
  const now = new Date();
  const data = [];
  
  let months = 1;
  switch (period) {
    case '3m': months = 3; break;
    case '6m': months = 6; break;
    case '1y': months = 12; break;
    case 'all': months = 24; break;
    default: months = 1;
  }
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    data.push({
      date: date.toISOString().slice(0, 10),
      averagePrice: 800000 - Math.random() * 50000 + i * 10000,
      property1: 750000 - Math.random() * 30000 + i * 8000,
      property2: 900000 - Math.random() * 40000 + i * 12000,
      property3: 650000 - Math.random() * 20000 + i * 5000,
    });
  }
  
  return data;
};

interface PriceHistoryChartProps {
  isLoading?: boolean;
  error?: Error | null;
}

export function PriceHistoryChart({ isLoading = false, error = null }: PriceHistoryChartProps) {
  const [timePeriod, setTimePeriod] = useState('3m');
  const [showAverage, setShowAverage] = useState(true);
  const [showIndividual, setShowIndividual] = useState(false);
  
  const data = generateMockData(timePeriod);
  
  const periods = [
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'All' },
  ];

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent className="h-80 animate-pulse bg-gray-100"></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">Failed to load price history data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Price History</CardTitle>
        <div className="flex space-x-2">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={timePeriod === period.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimePeriod(period.value)}
                className="text-xs h-7"
              >
                {period.label}
              </Button>
            ))}
          </div>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
            <Button
              variant={showAverage ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowAverage(!showAverage)}
              className="text-xs h-7"
            >
              Average
            </Button>
            <Button
              variant={showIndividual ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowIndividual(!showIndividual)}
              className="text-xs h-7"
            >
              Individual
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis tickFormatter={formatTooltipValue} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              {showAverage && (
                <Line
                  type="monotone"
                  dataKey="averagePrice"
                  name="Average Price"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )}
              {showIndividual && (
                <>
                  <Line type="monotone" dataKey="property1" name="Property 1" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="property2" name="Property 2" stroke="#ffc658" />
                  <Line type="monotone" dataKey="property3" name="Property 3" stroke="#ff8042" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
