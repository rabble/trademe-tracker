import { Link } from 'react-router-dom'
import { PropertyCard } from '../components/property/PropertyCard'

export function DashboardPage() {
  // Mock data - in a real app this would come from an API
  const propertySummary = {
    total: 12,
    active: 8,
    underOffer: 2,
    sold: 2,
    averagePrice: '$875,000',
    averageDaysOnMarket: 24
  }
  
  const recentProperties = [
    {
      id: '1',
      title: '3 Bedroom House in Ponsonby',
      address: '123 Richmond Road, Ponsonby, Auckland',
      price: '$1,250,000',
      bedrooms: 3,
      bathrooms: 2,
      imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      status: 'active' as const,
      daysOnMarket: 7,
      priceChange: {
        type: 'decrease' as const,
        amount: '$50,000'
      }
    },
    {
      id: '2',
      title: 'Modern Apartment with City Views',
      address: '42 Queen Street, Auckland CBD',
      price: '$895,000',
      bedrooms: 2,
      bathrooms: 2,
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      status: 'under_offer' as const,
      daysOnMarket: 14
    },
    {
      id: '3',
      title: 'Lifestyle Block with Mountain Views',
      address: '789 Rural Road, Waikato',
      price: '$1,750,000',
      bedrooms: 4,
      bathrooms: 3,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      status: 'active' as const,
      daysOnMarket: 30
    }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-indigo-800 text-sm font-medium">Properties</h3>
            <div className="mt-2 flex justify-between">
              <div className="text-2xl font-bold text-indigo-900">{propertySummary.total}</div>
              <div className="text-sm text-indigo-700">
                <div>{propertySummary.active} active</div>
                <div>{propertySummary.underOffer} under offer</div>
                <div>{propertySummary.sold} sold</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-800 text-sm font-medium">Average Price</h3>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-900">{propertySummary.averagePrice}</div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-800 text-sm font-medium">Avg. Days on Market</h3>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-900">{propertySummary.averageDaysOnMarket}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Properties */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
          <Link to="/properties" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All Properties
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map(property => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
      
      {/* AI Insights Placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">AI-powered insights about your favorited properties will appear here.</p>
        </div>
      </div>
    </div>
  )
}
import { Link } from 'react-router-dom'
import { PropertyCard } from '../components/property/PropertyCard'

export function DashboardPage() {
  // Mock data - in a real app this would come from an API
  const propertySummary = {
    total: 12,
    active: 8,
    underOffer: 2,
    sold: 2,
    averagePrice: '$875,000',
    averageDaysOnMarket: 24
  }
  
  const recentProperties = [
    {
      id: '1',
      title: '3 Bedroom House in Ponsonby',
      address: '123 Richmond Road, Ponsonby, Auckland',
      price: '$1,250,000',
      bedrooms: 3,
      bathrooms: 2,
      imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      status: 'active' as const,
      daysOnMarket: 7,
      priceChange: {
        type: 'decrease' as const,
        amount: '$50,000'
      }
    },
    {
      id: '2',
      title: 'Modern Apartment with City Views',
      address: '42 Queen Street, Auckland CBD',
      price: '$895,000',
      bedrooms: 2,
      bathrooms: 2,
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      status: 'under_offer' as const,
      daysOnMarket: 14
    },
    {
      id: '3',
      title: '4 Bedroom Lifestyle Block with Mountain Views',
      address: '789 Rural Road, Waikato',
      price: '$1,750,000',
      bedrooms: 4,
      bathrooms: 3,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      status: 'active' as const,
      daysOnMarket: 30
    }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-indigo-800 text-sm font-medium">Properties</h3>
            <div className="mt-2 flex justify-between">
              <div className="text-2xl font-bold text-indigo-900">{propertySummary.total}</div>
              <div className="text-sm text-indigo-700">
                <div>{propertySummary.active} active</div>
                <div>{propertySummary.underOffer} under offer</div>
                <div>{propertySummary.sold} sold</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-800 text-sm font-medium">Average Price</h3>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-900">{propertySummary.averagePrice}</div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-800 text-sm font-medium">Avg. Days on Market</h3>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-900">{propertySummary.averageDaysOnMarket}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Properties */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
          <Link to="/properties" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All Properties
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map(property => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
      
      {/* AI Insights Placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">AI-powered insights about your favorited properties will appear here.</p>
        </div>
      </div>
    </div>
  )
}
