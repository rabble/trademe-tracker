import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../hooks/useAuth';

export function PropertyImportPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedProperty, setScrapedProperty] = useState<Partial<Property> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyData, setPropertyData] = useState<Partial<Property>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  // Generate sample property data based on URL
  const generateSampleProperty = (inputUrl: string) => {
    const url = new URL(inputUrl);
    const hostname = url.hostname;
    const path = url.pathname;
    
    // Extract some information from the URL for the demo
    const pathParts = path.split('/').filter(part => part);
    const lastPathPart = pathParts[pathParts.length - 1] || '';
    
    // Generate a sample title based on the URL
    const titlePart = lastPathPart.replace(/-/g, ' ').replace(/\d+/g, '').trim();
    const location = pathParts[0]?.replace(/-/g, ' ') || 'Auckland';
    
    // Generate a random price between 500,000 and 1,500,000
    const price = Math.floor(Math.random() * 1000000) + 500000;
    
    // Generate random bedrooms and bathrooms
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    
    return {
      title: `Beautiful ${bedrooms} Bedroom Home in ${location.charAt(0).toUpperCase() + location.slice(1)}`,
      address: `${Math.floor(Math.random() * 100) + 1} ${titlePart.charAt(0).toUpperCase() + titlePart.slice(1)} Street, ${location.charAt(0).toUpperCase() + location.slice(1)}`,
      description: `This lovely property features ${bedrooms} bedrooms and ${bathrooms} bathrooms. Located in a prime area of ${location}, this property offers excellent amenities and easy access to local shops and transport.`,
      price,
      bedrooms,
      bathrooms,
      property_type: 'house',
      status: 'active',
      days_on_market: Math.floor(Math.random() * 30),
      url: inputUrl,
      primary_image_url: `/images/placeholder.svg`,
      listing_type: 'for_sale'
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Check if URL is valid
      const validUrl = new URL(url); // This will throw if URL is invalid
      
      // Two-pronged approach: Use both server-side scraping and client-side FireCrawl
      const isTradeMeUrl = validUrl.hostname.includes('trademe.co.nz');
      
      // First try server-side scraping
      try {
        const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/api/properties/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        
        const result = await response.json();
        
        // If server-side scraping was successful, use that data
        if (result.success && result.property) {
          console.log('Server-side scraped property data:', result.property);
          
          // If it's a TradeMe URL and we also need client-side scraping
          if (isTradeMeUrl && result.isTradeMe) {
            // Try client-side FireCrawl scraping for additional data
            try {
              // Import the trademeScraper service
              const { trademeScraper } = await import('../services/trademe/trademeScraper');
              
              // Scrape the URL
              const clientScrapedProperty = await trademeScraper.scrapeUrl(url);
              console.log('Client-side scraped property data:', clientScrapedProperty);
              
              // Merge the two results, preferring client-side data where available
              const mergedProperty = {
                ...result.property,
                ...clientScrapedProperty,
                // For image URLs, combine both sources
                image_urls: [
                  ...(clientScrapedProperty.image_urls || []),
                  ...(result.property.image_urls || [])
                ].filter((url, index, self) => 
                  // Remove duplicates
                  self.indexOf(url) === index
                )
              };
              
              // If we have images, ensure we have a primary
              if (mergedProperty.image_urls && mergedProperty.image_urls.length > 0 && !mergedProperty.primary_image_url) {
                mergedProperty.primary_image_url = mergedProperty.image_urls[0];
              }
              
              setScrapedProperty(mergedProperty);
              setPropertyData(mergedProperty);
              setIsEditing(true);
              setIsLoading(false);
              return;
            } catch (clientScrapingError) {
              console.error('Error with client-side scraping:', clientScrapingError);
              // If client-side scraping fails, just use the server-side data
              setScrapedProperty(result.property);
              setPropertyData(result.property);
              setIsEditing(true);
              setIsLoading(false);
              return;
            }
          } else {
            // For non-TradeMe URLs or if no client-side scraping needed
            setScrapedProperty(result.property);
            setPropertyData(result.property);
            setIsEditing(true);
            setIsLoading(false);
            return;
          }
        } else if (isTradeMeUrl) {
          // If server-side failed but it's TradeMe, try client-side only
          try {
            // Import the trademeScraper service
            const { trademeScraper } = await import('../services/trademe/trademeScraper');
            
            // Scrape the URL
            const clientScrapedProperty = await trademeScraper.scrapeUrl(url);
            console.log('Client-only scraped property data:', clientScrapedProperty);
            
            if (clientScrapedProperty && clientScrapedProperty.title) {
              setScrapedProperty(clientScrapedProperty);
              setPropertyData(clientScrapedProperty);
              setIsEditing(true);
              setIsLoading(false);
              return;
            }
          } catch (clientOnlyError) {
            console.error('Error with client-only scraping:', clientOnlyError);
          }
        }
        
        // If we get here, both server and client scraping failed or returned insufficient data
        console.warn('Scraping returned incomplete data, falling back to simple extraction');
        const parsedProperty = extractBasicInfo(url);
        setScrapedProperty(parsedProperty);
        setPropertyData(parsedProperty);
        setIsEditing(true);
        setIsLoading(false);
      } catch (serverScrapingError) {
        console.error('Error with server-side scraping:', serverScrapingError);
        
        // Server scraping failed, try client-side if it's TradeMe
        if (isTradeMeUrl) {
          try {
            // Import the trademeScraper service
            const { trademeScraper } = await import('../services/trademe/trademeScraper');
            
            // Scrape the URL
            const clientScrapedProperty = await trademeScraper.scrapeUrl(url);
            
            if (clientScrapedProperty && clientScrapedProperty.title) {
              setScrapedProperty(clientScrapedProperty);
              setPropertyData(clientScrapedProperty);
              setIsEditing(true);
              setIsLoading(false);
              return;
            }
          } catch (clientFallbackError) {
            console.error('Error with client fallback scraping:', clientFallbackError);
          }
        }
        
        // All scraping methods failed, fall back to basic extraction
        const parsedProperty = extractBasicInfo(url);
        setScrapedProperty(parsedProperty);
        setPropertyData(parsedProperty);
        setIsEditing(true);
        setIsLoading(false);
      }
    } catch (urlError) {
      setError('Please enter a valid URL (e.g., https://www.example.com/property/123)');
      setIsLoading(false);
    }
  };
  
  // Extract basic information from the URL
  const extractBasicInfo = (url: string): Partial<Property> => {
    // Only extract the URL and listing ID - as a fallback
    const property: Partial<Property> = {
      url: url,
      status: 'active',
      days_on_market: 0
    };
    
    try {
      // Parse the URL to extract the listing ID
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      
      // Determine property type from URL
      if (url.includes('lifestyle-property')) {
        property.property_type = 'lifestyle';
      } else if (url.includes('section-land')) {
        property.property_type = 'section';
      } else if (url.includes('townhouse')) {
        property.property_type = 'townhouse';
      } else if (url.includes('apartment')) {
        property.property_type = 'apartment';
      } else {
        property.property_type = 'house';
      }
      
      // Determine listing type from URL
      if (url.includes('rent')) {
        property.listing_type = 'rental';
      } else {
        property.listing_type = 'for_sale';
      }
      
      // Extract listing ID if present (usually the last numeric segment)
      const listingIdSegment = pathSegments[pathSegments.length - 1];
      if (/^\d+$/.test(listingIdSegment)) {
        // Set property title to reflect that we only have the ID
        property.title = `TradeMe Property Listing #${listingIdSegment}`;
        
        // Add a note in the description about where the data came from
        property.description = `This is a property from TradeMe with listing ID ${listingIdSegment}. Please manually enter details about this property.`;
      } else {
        // If no ID found, set a generic title
        property.title = 'TradeMe Property Listing';
        property.description = 'Please manually enter details about this property from TradeMe.';
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      property.title = 'Property Listing';
      property.description = 'Please manually enter details about this property.';
    }
    
    return property;
  };

  // Handle property data changes
  const handlePropertyDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setPropertyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setPropertyData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value)
    }));
  };

  // Handle save property
  const handleSaveProperty = async () => {
    if (!propertyData.title) {
      setError('Title is required');
      return;
    }

    // If user is not logged in, show login prompt
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Make sure we have the URL and all required fields
      const dataToSave = {
        ...propertyData,
        url: propertyData.url || url,
        status: propertyData.status || 'active',
        days_on_market: propertyData.days_on_market || 0,
        listing_type: propertyData.listing_type || 'for_sale',
        // Ensure we have a proper address
        address: propertyData.address || 'Unknown location',
        // Ensure we have a price (different defaults for sale vs rental)
        price: propertyData.price || (propertyData.listing_type === 'rental' ? 500 : 750000),
        // In a real app, you'd get user_id from auth context
        user_id: 'current-user-id'
      };
      
      console.log('Saving property data:', dataToSave);
      
      // Call the worker API to create the property
      const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/api/properties/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
        // Add proper CORS mode
        mode: 'cors',
        credentials: 'omit'
      });
      
      const result = await response.json();
      console.log('Server response:', result);
      
      setIsLoading(false);
      
      if (response.ok && result.success) {
        // Show success message before navigating
        console.log('Property saved successfully with ID:', result.id);
        
        // Navigate to property details page
        navigate(`/properties/${result.id}`);
      } else {
        setError(result.error || 'Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setError('An error occurred while saving the property. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">MiVoy Property Import</h1>
      
      {!isLoggedIn && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Demo Mode:</span> Enter any property URL to see how MiVoy extracts listing details. <Link to="/login" className="font-medium underline">Sign in</Link> or <Link to="/register" className="font-medium underline">create an account</Link> to save properties to your collection.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!isEditing ? (
        // URL Input Form
        <>
          <p className="mb-4 text-gray-600">
            Enter a URL to a property listing, and we'll automatically extract the details for you.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-lg mb-8">
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Property URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://www.example.com/property-listing"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Importing...' : 'Import Property'}
            </button>
          </form>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-8">
            <h2 className="text-lg font-medium mb-2">How it works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Paste a URL from any property listing website</li>
              <li>Our system will automatically extract property details</li>
              <li>Review and edit the information before saving</li>
              <li>Add the property to your collection</li>
            </ol>
          </div>
        </>
      ) : (
        // Property Editing Form
        <>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Property details successfully imported! Please review and edit the information below.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Property Details</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Review and edit the imported property information.</p>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Basic Information</h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={propertyData.title || ''}
                            onChange={handlePropertyDataChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={propertyData.address || ''}
                            onChange={handlePropertyDataChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={propertyData.description || ''}
                            onChange={handlePropertyDataChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Property Details</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                          </label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={propertyData.price || ''}
                            onChange={handleNumberChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Property Type
                          </label>
                          <select
                            id="property_type"
                            name="property_type"
                            value={propertyData.property_type || ''}
                            onChange={handlePropertyDataChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select type</option>
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="townhouse">Townhouse</option>
                            <option value="section">Section</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                            Bedrooms
                          </label>
                          <input
                            type="number"
                            id="bedrooms"
                            name="bedrooms"
                            value={propertyData.bedrooms || ''}
                            onChange={handleNumberChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                            Bathrooms
                          </label>
                          <input
                            type="number"
                            id="bathrooms"
                            name="bathrooms"
                            value={propertyData.bathrooms || ''}
                            onChange={handleNumberChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="listing_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Listing Type
                          </label>
                          <select
                            id="listing_type"
                            name="listing_type"
                            value={propertyData.listing_type || 'for_sale'}
                            onChange={handlePropertyDataChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="for_sale">For Sale</option>
                            <option value="rental">Rental</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={propertyData.status || 'active'}
                            onChange={handlePropertyDataChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="active">Active</option>
                            <option value="under_offer">Under Offer</option>
                            <option value="sold">Sold</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Media */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Media</h4>
                      
                      <div>
                        <label htmlFor="primary_image_url" className="block text-sm font-medium text-gray-700 mb-1">
                          Primary Image URL
                        </label>
                        <input
                          type="url"
                          id="primary_image_url"
                          name="primary_image_url"
                          value={propertyData.primary_image_url || ''}
                          onChange={handlePropertyDataChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProperty}
                    disabled={isLoading}
                    className={`inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${
                      isLoggedIn 
                        ? 'text-white bg-indigo-600 hover:bg-indigo-700 border-transparent' 
                        : 'text-indigo-600 bg-white hover:bg-indigo-50 border-indigo-600'
                    }`}
                  >
                    {isLoading 
                      ? 'Processing...' 
                      : isLoggedIn 
                        ? 'Save Property' 
                        : 'Sign in to Save Property'}
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Preview</h3>
                </div>
                
                <div className="border-t border-gray-200">
                  {propertyData.primary_image_url ? (
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={propertyData.primary_image_url} 
                        alt={propertyData.title || 'Property'}
                        className="object-cover w-full h-48"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = '/images/placeholder.svg';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 w-full h-48 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  
                  <div className="px-4 py-5 sm:px-6">
                    <h4 className="text-lg font-medium">{propertyData.title || 'Untitled Property'}</h4>
                    
                    {propertyData.address && (
                      <p className="mt-1 text-sm text-gray-500">{propertyData.address}</p>
                    )}
                    
                    {propertyData.price !== undefined && (
                      <p className="mt-2 text-xl font-semibold">
                        ${propertyData.price.toLocaleString()}
                        {propertyData.listing_type === 'rental' && <span className="text-sm font-normal">/week</span>}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      {propertyData.bedrooms !== undefined && (
                        <span className="mr-3">{propertyData.bedrooms} bed{propertyData.bedrooms !== 1 ? 's' : ''}</span>
                      )}
                      
                      {propertyData.bathrooms !== undefined && (
                        <span>{propertyData.bathrooms} bath{propertyData.bathrooms !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    
                    {propertyData.status && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${propertyData.status === 'active' ? 'bg-green-100 text-green-800' :
                            propertyData.status === 'under_offer' ? 'bg-yellow-100 text-yellow-800' :
                            propertyData.status === 'sold' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {propertyData.status.replace('_', ' ').charAt(0).toUpperCase() + propertyData.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {propertyData.description && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          {propertyData.description.length > 150 
                            ? `${propertyData.description.substring(0, 150)}...` 
                            : propertyData.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Source Information</h3>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Source URL</h4>
                    <a href={url} target="_blank" rel="noreferrer" className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 break-all">
                      {url}
                    </a>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Import Date</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Sign in to Save Properties</h3>
            <p className="text-gray-600 mb-6">
              You need to be signed in to save properties to your account. Would you like to sign in or create an account?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/login" 
                className="flex-1 px-4 py-2 bg-indigo-600 text-white text-center font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 text-center font-medium rounded-md hover:bg-indigo-50 transition-colors"
              >
                Create Account
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 sm:flex-initial px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}