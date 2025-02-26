import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProperty } from '../hooks/property/useProperty'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '../utils/formatters'

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isLoading, error } = useProperty(id || '')
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'similar'>('details')
  const [notes, setNotes] = useState('')

  // Dummy price history data for chart (using property.created_at and last_price_change if available)
  const priceHistory = property ? (() => {
    const history = []
    history.push({ date: property.created_at, price: property.price })
    if (property.last_price_change) {
      history.push({ date: property.last_price_change.date, price: property.last_price_change.new_price })
    }
    return history
  })() : []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="text-center text-red-600 py-6">
        Error loading property details.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-indigo-600 hover:text-indigo-800"
      >
        &larr; Back to properties
      </button>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          {/* Image gallery */}
          <div className="mb-4">
            <img
              src={property.primary_image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={property.title}
              className="w-full h-96 object-cover rounded"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {/* Thumbnails (using same image as placeholder) */}
            {[1, 2, 3, 4].map(i => (
              <img
                key={i}
                src={property.primary_image_url || 'https://via.placeholder.com/150?text=No+Image'}
                alt={`${property.title} ${i}`}
                className="w-24 h-16 object-cover rounded cursor-pointer"
              />
            ))}
          </div>
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-600 mb-2">{property.address}</p>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-xl font-bold text-indigo-600">{formatCurrency(property.price)}</div>
            <div className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
              {property.status.replace('_', ' ')}
            </div>
          </div>
          {/* Tab navigation */}
          <div className="border-b mb-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={activeTab === 'details' ? "border-b-2 border-indigo-600 text-indigo-600 pb-2" : "text-gray-600 pb-2"}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={activeTab === 'history' ? "border-b-2 border-indigo-600 text-indigo-600 pb-2" : "text-gray-600 pb-2"}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={activeTab === 'similar' ? "border-b-2 border-indigo-600 text-indigo-600 pb-2" : "text-gray-600 pb-2"}
              >
                Similar Properties
              </button>
            </nav>
          </div>
          {activeTab === 'details' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Property Details</h2>
              <p className="text-gray-700 mb-4">{property.description || "No description available."}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Bedrooms:</p>
                  <p>{property.bedrooms ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Bathrooms:</p>
                  <p>{property.bathrooms ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Land Area:</p>
                  <p>{property.land_area ? `${property.land_area} m²` : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Floor Area:</p>
                  <p>{property.floor_area ? `${property.floor_area} m²` : 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">Agent Information</h3>
                <p className="text-gray-600">Agent details not available in sample data.</p>
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Price History</h2>
              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={priceHistory}>
                    <XAxis dataKey="date" tickFormatter={(value: string) => new Date(value).toLocaleDateString()} />
                    <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
                    <Tooltip 
                      labelFormatter={(value: string) => formatDate(new Date(value))} 
                      formatter={(value: number) => formatCurrency(value)} 
                    />
                    <Line type="monotone" dataKey="price" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No price history available.</p>
              )}
              <div className="mt-4">
                <h3 className="font-semibold">Status History</h3>
                <p className="text-gray-600">Status history not available in sample data.</p>
              </div>
            </div>
          )}
          {activeTab === 'similar' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Similar Properties</h2>
              <p className="text-gray-600">Similar properties will be shown here.</p>
            </div>
          )}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Your Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this property..."
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
            />
            <button
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => console.log('Save notes:', notes)}
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">AI Insights</h2>
        <p className="text-gray-600">AI-generated insights about this property will appear here.</p>
      </div>
    </div>
  )
}
