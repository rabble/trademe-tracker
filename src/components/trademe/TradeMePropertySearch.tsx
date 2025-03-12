import React, { useState } from 'react';
import { useTradeMeSearch } from '../../hooks/useTradeMeSearch';
import { PropertyCardGrid } from '../property/PropertyCardGrid';
import { SearchBar } from '../filter/SearchBar';
import { Button } from '../ui/button';
import { Select } from '../ui/select';

export function TradeMePropertySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [searchParams, setSearchParams] = useState<Record<string, string>>({
    category: '5', // Property category
  });

  const { properties, isLoading, error, refetch } = useTradeMeSearch(searchParams);

  const handleSearch = () => {
    const params: Record<string, string> = {
      category: '5', // Property category
    };

    if (searchQuery) {
      params.search_string = searchQuery;
    }

    if (region) {
      params.region = region;
    }

    if (propertyType) {
      params.property_type = propertyType;
    }

    if (priceMin) {
      params.price_min = priceMin;
    }

    if (priceMax) {
      params.price_max = priceMax;
    }

    if (bedrooms) {
      params.bedrooms_min = bedrooms;
    }

    setSearchParams(params);
  };

  const propertyCards = properties.map(property => ({
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price.toString(),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    imageUrl: property.image_urls?.[0],
    status: property.status
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">TradeMe Property Search</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search properties..."
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <Select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full"
            >
              <option value="">All Regions</option>
              <option value="1">Auckland</option>
              <option value="2">Bay of Plenty</option>
              <option value="3">Canterbury</option>
              <option value="4">Gisborne</option>
              <option value="5">Hawke's Bay</option>
              <option value="6">Manawatu/Whanganui</option>
              <option value="7">Marlborough</option>
              <option value="8">Nelson/Tasman</option>
              <option value="9">Northland</option>
              <option value="10">Otago</option>
              <option value="11">Southland</option>
              <option value="12">Taranaki</option>
              <option value="13">Waikato</option>
              <option value="14">Wellington</option>
              <option value="15">West Coast</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <Select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full"
            >
              <option value="">All Types</option>
              <option value="1">House</option>
              <option value="2">Apartment</option>
              <option value="3">Townhouse</option>
              <option value="4">Unit</option>
              <option value="5">Section</option>
              <option value="6">Lifestyle</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <Select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Min</label>
            <Select
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full"
            >
              <option value="">No Min</option>
              <option value="100000">$100,000</option>
              <option value="200000">$200,000</option>
              <option value="300000">$300,000</option>
              <option value="400000">$400,000</option>
              <option value="500000">$500,000</option>
              <option value="600000">$600,000</option>
              <option value="700000">$700,000</option>
              <option value="800000">$800,000</option>
              <option value="900000">$900,000</option>
              <option value="1000000">$1,000,000</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Max</label>
            <Select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full"
            >
              <option value="">No Max</option>
              <option value="200000">$200,000</option>
              <option value="300000">$300,000</option>
              <option value="400000">$400,000</option>
              <option value="500000">$500,000</option>
              <option value="600000">$600,000</option>
              <option value="700000">$700,000</option>
              <option value="800000">$800,000</option>
              <option value="900000">$900,000</option>
              <option value="1000000">$1,000,000</option>
              <option value="1500000">$1,500,000</option>
              <option value="2000000">$2,000,000</option>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSearch} className="px-6">
            Search
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Error loading properties: {error.message}
        </div>
      )}
      
      <PropertyCardGrid 
        properties={propertyCards}
        isLoading={isLoading}
        skeletonCount={8}
      />
    </div>
  );
}
