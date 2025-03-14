import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProperty } from '../hooks/property/useProperty'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '../utils/formatters'
import { MapView } from '../components/map/MapView'
import { supabase } from '../lib/supabase'

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isLoading, error } = useProperty(id || '')
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'similar'>('details')
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  
  // Load existing notes when component mounts
  useEffect(() => {
    async function loadNotes() {
      if (!id) return;
      
      try {
        console.log('Loading notes for property:', id);
        console.log('Property ID type:', typeof id);
        
        // Check if id is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          console.warn('Invalid UUID format for property ID:', id);
          return;
        }
        
        const { data, error } = await supabase
          .from('properties')
          .select('user_notes')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error loading notes:', error);
        } else {
          console.log('Loaded notes:', data?.user_notes);
          setNotes(data?.user_notes || '');
        }
      } catch (err) {
        console.error('Exception loading notes:', err);
      }
    }
    
    loadNotes();
  }, [id]);

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to properties
      </button>
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <div className="md:w-1/2">
          {/* Image gallery */}
          <div className="mb-4 overflow-hidden rounded-lg shadow-md">
            <img
              src={property.primary_image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={property.title}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {/* Thumbnails (using same image as placeholder) */}
            {[1, 2, 3, 4].map(i => (
              <img
                key={i}
                src={property.primary_image_url || 'https://via.placeholder.com/150?text=No+Image'}
                alt={`${property.title} ${i}`}
                className="w-24 h-16 object-cover rounded-md shadow cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{property.title}</h1>
          <p className="text-gray-600 mb-3">{property.address}</p>
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-2xl font-bold text-indigo-600">{formatCurrency(property.price)}</div>
            <div className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 uppercase">
              {property.status.replace('_', ' ')}
            </div>
          </div>
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={activeTab === 'details' 
                  ? "border-b-2 border-indigo-600 text-indigo-600 pb-3 px-1 font-medium" 
                  : "text-gray-500 hover:text-gray-700 pb-3 px-1 font-medium"}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={activeTab === 'history' 
                  ? "border-b-2 border-indigo-600 text-indigo-600 pb-3 px-1 font-medium" 
                  : "text-gray-500 hover:text-gray-700 pb-3 px-1 font-medium"}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={activeTab === 'similar' 
                  ? "border-b-2 border-indigo-600 text-indigo-600 pb-3 px-1 font-medium" 
                  : "text-gray-500 hover:text-gray-700 pb-3 px-1 font-medium"}
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              rows={4}
            />
            <button
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              onClick={async () => {
                try {
                  console.log('Saving notes to database:', notes);
                  console.log('Property ID:', id);
                  console.log('Property ID type:', typeof id);
                  
                  // Check if id is a valid UUID
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  if (!uuidRegex.test(id || '')) {
                    console.error('Invalid UUID format for property ID:', id);
                    alert('Cannot save notes: Invalid property ID format');
                    return;
                  }
                  
                  setIsSavingNotes(true);
                  
                  // Direct Supabase update
                  const { data, error } = await supabase
                    .from('properties')
                    .update({ user_notes: notes })
                    .eq('id', id)
                    .select();
                  
                  if (error) {
                    console.error('Error saving notes:', error);
                    alert('Failed to save notes: ' + error.message);
                  } else {
                    console.log('Notes saved successfully:', data);
                    alert('Notes saved successfully!');
                  }
                } catch (err) {
                  console.error('Exception saving notes:', err);
                  alert('An error occurred while saving notes');
                } finally {
                  setIsSavingNotes(false);
                }
              }}
              disabled={isSavingNotes}
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
      <div className="mt-10 bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4">AI Insights</h2>
        <p className="text-gray-600">AI-generated insights about this property will appear here.</p>
      </div>
      
      {/* Property Map */}
      <div className="mt-10">
        <MapView properties={[property]} />
      </div>
    </div>
  )
}
