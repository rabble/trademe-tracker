import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { sampleProperties } from '../data/sampleProperties'
import { PropertyCarousel } from '../components/property'
import { MarketingNav } from '../components/layout'

export function LandingPage() {
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    // Format properties for the carousel
    const formattedProperties = sampleProperties.map(property => {
      // Calculate price change if it exists
      let priceChange = undefined
      if (property.last_price_change) {
        const { old_price, new_price } = property.last_price_change
        const type = new_price < old_price ? 'decrease' : 'increase'
        const amount = Math.abs(new_price - old_price).toLocaleString('en-NZ', { 
          style: 'currency', 
          currency: 'NZD',
          maximumFractionDigits: 0
        })
        
        priceChange = {
          type,
          amount,
          change_date: property.last_price_change.date
        }
      }

      // Format price based on listing type
      const formattedPrice = property.listing_type === 'rental' 
        ? `$${property.price}/week`
        : new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(property.price)
      
      return {
        id: property.id,
        title: property.title,
        address: property.address,
        price: formattedPrice,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        imageUrl: property.primary_image_url,
        status: property.status,
        daysOnMarket: property.days_on_market,
        priceChange,
        isNew: property.days_on_market <= 3
      }
    })

    setProperties(formattedProperties)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-amber-700 to-pink-700">
        {/* Navigation */}
        <MarketingNav />
        
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="/images/32752606548_e1dd287ddb_o.jpg"
            alt="Beautiful coastal view with houses"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-pink-700 opacity-80 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Your Next Adventure Awaits</h1>
          <p className="mt-6 text-2xl font-semibold text-indigo-100 max-w-3xl">
            Find it. Save it. Make the move. ¡Mi Voy!
          </p>
          <p className="mt-4 text-xl text-indigo-100 max-w-3xl">
            Discover your dream property anywhere in the world. MiVoy is your personal collection of possibilities - from charming Spanish villas to remote mountain cabins, affordable countryside cottages to urban penthouses. Every property that catches your eye, organized in one beautiful place.
          </p>
          <p className="mt-4 text-lg text-indigo-200 max-w-3xl">
            Whether you're actively house-hunting or just daydreaming about that cabin in the woods, MiVoy keeps your possibilities organized and inspiring. Because sometimes saying "I'm going for it!" starts with a simple bookmark.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link
              to="/login"
              className="inline-block bg-white py-3 px-6 border border-transparent rounded-md text-base font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-amber-500 to-pink-500 py-3 px-8 border border-transparent rounded-md text-base font-bold text-white hover:from-amber-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Your Collection
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Properties Carousel */}
      <div className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Featured Properties</h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
              Discover Beautiful Homes
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Browse our selection of stunning properties available right now.
            </p>
          </div>
          
          {properties.length > 0 && (
            <PropertyCarousel properties={properties} />
          )}
          
          <div className="text-center mt-8">
            <Link 
              to="/register" 
              className="inline-block bg-gradient-to-r from-amber-500 to-pink-500 py-3 px-6 border border-transparent rounded-md text-base font-bold text-white hover:from-amber-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              See More Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Start Your Journey</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Create Your Property Dreams
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              MiVoy helps you track the properties you love across the globe. Create boards for different dreams - "Beachfront Retreats," "Off-Grid Havens," or "Under €100k in Portugal" - whatever inspires your next chapter.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-amber-500 to-pink-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Discover & Dream</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Explore unique properties from around the world and save them to your personalized collections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-amber-500 to-pink-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Create Collections</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Organize your favorites into personalized boards by location, style, price range, or any other category that inspires you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-amber-500 to-pink-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Share Your Finds</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Collaborate with partners, friends, and family on your property search. Share your favorite listings and collections with others.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Why MiVoy?</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
              Everything for Your Property Journey
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">Global</span>
                <p className="mt-2 text-sm text-gray-500">Properties worldwide</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">Visual</span>
                <p className="mt-2 text-sm text-gray-500">Beautiful collections</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">Track</span>
                <p className="mt-2 text-sm text-gray-500">Price & status changes</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">Social</span>
                <p className="mt-2 text-sm text-gray-500">Share with friends</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization section */}
      <div className="bg-gradient-to-r from-amber-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Where Will Your Dreams Take You?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                From Spanish villas to mountain cabins, beachfront condos to countryside cottages, MiVoy helps you discover, organize, and track properties from around the world.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-700">
                    Discover dream homes in any country or region
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-700">
                    Save and organize properties by location or style
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-700">
                    Track price changes and property status
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-700">
                    Collaborate with partners and friends
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:col-start-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                    <span className="bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">¡Mi Voy!</span>
                  </div>
                  <p className="mt-4 text-base text-gray-500">
                    "I'm going for it!" - MiVoy helps you turn property dreams into reality, whether it's a beachfront villa in Spain or a mountain cabin in the Rockies.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-pink-50 px-4 py-4 sm:p-6">
                  <div className="text-sm">
                    <div className="mb-2 font-semibold text-gray-800">Where will your dreams take you?</div>
                    <p className="text-gray-600">
                      Create your collection today. Whether you're planning a move abroad, hunting for your dream home, or just daydreaming about possibilities, MiVoy helps you organize your journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to start your journey?</span>
            <span className="block bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">Begin your property adventure today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-md text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Explore Properties
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-pink-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="mt-8 border-t border-amber-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link to="/about" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                About
              </Link>
              <Link to="/resources" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                Resources
              </Link>
              <Link to="/how-it-works" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                How It Works
              </Link>
              <Link to="/faq" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                FAQ
              </Link>
              <Link to="/contact" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                Contact
              </Link>
              <Link to="/about#privacy" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/about#terms" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                Terms of Service
              </Link>
              <a href="https://twitter.com/rabble" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com/rabble" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-amber-300 md:mt-0 md:order-1">
              &copy; 2025 MiVoy by <a href="https://rabblelabs.com" className="hover:text-pink-300 transition-colors duration-200">Rabble Labs</a>. <span className="font-light italic">¿Adónde irás?</span> (Where will you go?)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
