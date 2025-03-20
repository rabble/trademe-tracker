import { Link } from 'react-router-dom'
import { MarketingNav } from '../components/layout'

export function ComingSoonPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-amber-700 to-pink-700">
        {/* Navigation */}
        <MarketingNav />
        
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="/images/pantilokpom_meadow.jpg"
            alt="Beautiful meadow view for coming soon page"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-pink-700 opacity-80 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Coming Soon</h1>
          <p className="mt-6 text-2xl font-semibold text-indigo-100 max-w-3xl">
            The journey continues
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-pink-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">The journey continues</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Coming Soon to MiVoy
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              We're just getting started with TradeMe in New Zealand, but our property journey is expanding across the globe. Here's a sneak peek at what's coming next.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {/* Global Expansion */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-16 lg:items-center">
              <div className="lg:col-span-1">
                <div className="flex items-center justify-center h-52 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl">
                  <svg className="h-20 w-20 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-span-2">
                <h3 className="text-2xl font-extrabold text-gray-900">Global Property Platform Integrations</h3>
                <p className="mt-3 text-lg text-gray-500">
                  While we're starting with TradeMe in New Zealand, we're building partnerships with property platforms around the world. Soon you'll be able to track properties from:
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Australia</span> - Domain.com.au and RealEstate.com.au
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Europe</span> - Idealista (Spain & Portugal), Rightmove (UK), and Immobiliare.it (Italy)
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">North America</span> - Zillow, Realtor.com, and Redfin
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-base text-gray-700 italic">
                  Create collections of dream properties from multiple countries, all in one place.
                </p>
              </div>
            </div>

            {/* Advanced Search */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-16 lg:items-center">
              <div className="lg:col-span-1 order-first lg:order-last">
                <div className="flex items-center justify-center h-52 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl">
                  <svg className="h-20 w-20 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-span-2 lg:order-first">
                <h3 className="text-2xl font-extrabold text-gray-900">Advanced Property Search & Filters</h3>
                <p className="mt-3 text-lg text-gray-500">
                  Find exactly what you're looking for with our upcoming enhanced search capabilities. These powerful tools will let you drill down to the perfect property.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Proximity filters</span> - Find properties within specific distance of schools, beaches, public transport, or amenities
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Climate resilience scores</span> - Assess properties for flood, fire, or other climate risks
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Energy efficiency ratings</span> - Filter properties by solar potential, heating costs, and more
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Price history and market trends</span> - Make informed decisions with historical data and neighborhood analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-16 lg:items-center">
              <div className="lg:col-span-1">
                <div className="flex items-center justify-center h-52 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl">
                  <svg className="h-20 w-20 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-span-2">
                <h3 className="text-2xl font-extrabold text-gray-900">Collaborative Property Collections</h3>
                <p className="mt-3 text-lg text-gray-500">
                  Property hunting is often a team effort. Our upcoming collaboration features will transform how you and your partners, family, or friends search together.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Shared collections</span> - Invite others to view and contribute to your property boards
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Property notes & discussions</span> - Add comments to specific features, ask questions, and make decisions together
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Property ranking system</span> - Vote on favorite properties within your shared collections
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <span className="font-medium">Real-time notifications</span> - Stay updated when collaborators add properties or prices change
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-amber-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Stay Updated on Our Journey
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Be the first to know when we launch new features and expand to new regions. Sign up for our newsletter to receive updates and early access invitations.
              </p>
              <div className="mt-8">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:max-w-xs"
                    placeholder="Enter your email"
                  />
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                      Notify me
                    </button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-gray-500">
                  We care about your data. Read our{' '}
                  <a href="#" className="font-medium text-pink-600 hover:text-pink-500">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 relative">
              <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-w-5 aspect-h-3 bg-gradient-to-r from-amber-100 to-pink-100 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-pink-600 mb-2">¡Mi Voy!</div>
                    <div className="text-xl font-medium text-gray-700">Where will your dreams take you next?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Our Roadmap</h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
              What's Next for MiVoy
            </p>
            <p className="max-w-xl mt-5 mx-auto text-lg text-gray-500">
              Here's a sneak peek at our development timeline.
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto">
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="pr-3 bg-white text-lg font-medium text-gray-900">Now</span>
                </div>
              </div>
              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-pink-200">
                <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 -translate-x-1/2"></div>
                <h3 className="text-lg font-bold text-gray-900">New Zealand Launch</h3>
                <p className="mt-2 text-base text-gray-500">
                  Property tracking for TradeMe listings across New Zealand. Core features include property search, collections, and price tracking.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="pr-3 bg-white text-lg font-medium text-gray-900">Q2 2025</span>
                </div>
              </div>
              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-pink-200">
                <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 -translate-x-1/2"></div>
                <h3 className="text-lg font-bold text-gray-900">Collaborative Features</h3>
                <p className="mt-2 text-base text-gray-500">
                  Shared collections, property notes, and collaborative boards to make house hunting a team effort.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="pr-3 bg-white text-lg font-medium text-gray-900">Q3 2025</span>
                </div>
              </div>
              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-pink-200">
                <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 -translate-x-1/2"></div>
                <h3 className="text-lg font-bold text-gray-900">Australia Integration</h3>
                <p className="mt-2 text-base text-gray-500">
                  Expanding to Australia with Domain.com.au and RealEstate.com.au integrations.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="pr-3 bg-white text-lg font-medium text-gray-900">Q4 2025</span>
                </div>
              </div>
              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-pink-200">
                <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 -translate-x-1/2"></div>
                <h3 className="text-lg font-bold text-gray-900">Advanced Search Features</h3>
                <p className="mt-2 text-base text-gray-500">
                  Enhanced filters, proximity search, and detailed property analytics.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="pr-3 bg-white text-lg font-medium text-gray-900">2026</span>
                </div>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 -translate-x-1/2"></div>
                <h3 className="text-lg font-bold text-gray-900">Global Expansion</h3>
                <p className="mt-2 text-base text-gray-500">
                  Integration with property platforms across Europe, North America, and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to start your property journey?</span>
            <span className="block bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">
              Begin with what we have today!
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50"
              >
                Request a feature
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
              <Link to="/coming-soon" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                Coming Soon
              </Link>
              <a href="https://twitter.com/rabble" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
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