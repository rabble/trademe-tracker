import { Link } from 'react-router-dom'
import { PropertyCardGrid } from '../components/property/PropertyCardGrid'
import { useSummary } from '../hooks/analytics/useSummary'
import { useProperties } from '../hooks/property/useProperties'
import { useInsights } from '../hooks/analytics/useInsights'
import { formatCurrency } from '../utils/formatters'
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard'

export function DashboardPage() {
  // Fetch summary data
  const { 
    data: summary, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useSummary()
  
  // Fetch recent properties (limit to 3)
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading, 
    error: propertiesError 
  } = useProperties(
    { status: 'active' }, 
    { limit: 3 }
  )
  
  // Fetch insights
  const { 
    data: insights, 
    isLoading: insightsLoading, 
    error: insightsError 
  } = useInsights(undefined, 3)
  
  // Helper function to map property data to PropertyCard props
  const mapPropertyToCardProps = (property: any) => {
    return {
      id: property.id,
      title: property.title,
      address: property.address,
      price: formatCurrency(property.price),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      imageUrl: property.primary_image_url || 'https://via.placeholder.com/300x200?text=No+Image',
      status: property.status,
      daysOnMarket: property.days_on_market,
      priceChange: property.last_price_change ? {
        type: property.last_price_change.new_price < property.last_price_change.old_price ? 'decrease' as const : 'increase' as const,
        amount: formatCurrency(Math.abs(property.last_price_change.new_price - property.last_price_change.old_price))
      } : undefined
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">MiVoy Dashboard</h1>
      {/* Analytics Dashboard */}
      <AnalyticsDashboard 
        isLoading={summaryLoading} 
        error={summaryError ? new Error('Failed to load analytics data') : null} 
      />
      
      {/* Recent Properties */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
          <Link to="/properties" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All Properties
          </Link>
        </div>
        
        {propertiesLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : propertiesError ? (
          <div className="text-red-500 py-4">Error loading properties</div>
        ) : propertiesData && propertiesData.data.length > 0 ? (
          <PropertyCardGrid 
            properties={propertiesData.data.map(property => ({
              ...mapPropertyToCardProps(property),
              isNew: new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              onArchive: (id) => console.log(`Archive property ${id} from dashboard`)
            }))} 
          />
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add properties to start tracking them.
            </p>
            <div className="mt-6">
              <Link
                to="/properties/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Property
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Insights */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h2>
        
        {insightsLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : insightsError ? (
          <div className="text-red-500 py-4">Error loading insights</div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map(insight => (
              <div key={insight.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {insight.insight_type === 'price_trend' ? (
                      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    ) : insight.insight_type === 'market_comparison' ? (
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {insight.property_title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {insight.insight_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">AI-powered insights about your favorited properties will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
