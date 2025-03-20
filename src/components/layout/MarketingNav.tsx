import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

/**
 * MarketingNav - Dark themed navigation component for pages with hero images
 * Used on pages with dark backgrounds or hero sections that need light text
 * Contains responsive mobile menu with hamburger toggle
 * Automatically highlights the current page in the navigation
 */
export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  // Function to determine if a link is active
  const isActive = (path: string): boolean => {
    return currentPath === path
  }

  return (
    <div className="relative z-10">
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4" aria-label="Global">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-end">
            <Link to="/">
              <span className="sr-only">MiVoy</span>
              <h1 className="text-2xl font-bold text-white">MiVoy</h1>
            </Link>
            
            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex md:items-end md:space-x-8 md:ml-12">
              <Link 
                to="/about" 
                className={`text-base font-medium hover:text-pink-100 ${
                  isActive('/about') ? 'text-white border-b-2 border-pink-300 font-bold' : 'text-white'
                }`}
              >
                About
              </Link>
              <Link 
                to="/resources" 
                className={`text-base font-medium hover:text-pink-100 ${
                  isActive('/resources') ? 'text-white border-b-2 border-pink-300 font-bold' : 'text-white'
                }`}
              >
                Resources
              </Link>
              <Link 
                to="/how-it-works" 
                className={`text-base font-medium hover:text-pink-100 ${
                  isActive('/how-it-works') ? 'text-white border-b-2 border-pink-300 font-bold' : 'text-white'
                }`}
              >
                How It Works
              </Link>
              <Link 
                to="/faq" 
                className={`text-base font-medium hover:text-pink-100 ${
                  isActive('/faq') ? 'text-white border-b-2 border-pink-300 font-bold' : 'text-white'
                }`}
              >
                FAQ
              </Link>
              <Link 
                to="/contact" 
                className={`text-base font-medium hover:text-pink-100 ${
                  isActive('/contact') ? 'text-white border-b-2 border-pink-300 font-bold' : 'text-white'
                }`}
              >
                Contact
              </Link>
              <Link 
                to="/coming-soon" 
                className={`text-base font-medium hover:text-pink-100 ${
                  isActive('/coming-soon') ? 'text-white border-b-2 border-pink-300 font-bold' : 'text-white'
                }`}
              >
                Coming Soon
              </Link>
            </div>
          </div>
          
          {/* Spacer - pushes sign in to the right */}
          <div className="flex-grow"></div>
          
          {/* Sign In Button */}
          <div className="flex items-center">
            <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-pink-700 bg-white hover:bg-pink-50">
              Sign in
            </Link>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-pink-100 hover:bg-pink-800 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 rounded-lg bg-pink-900 bg-opacity-95 shadow-lg ring-1 ring-black ring-opacity-5 p-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/about" 
                className={`text-base font-medium block py-2 ${
                  isActive('/about') 
                    ? 'text-white border-l-4 border-pink-300 pl-2 font-bold' 
                    : 'text-white hover:text-pink-100'
                }`}
              >
                About
              </Link>
              <Link 
                to="/resources" 
                className={`text-base font-medium block py-2 ${
                  isActive('/resources') 
                    ? 'text-white border-l-4 border-pink-300 pl-2 font-bold' 
                    : 'text-white hover:text-pink-100'
                }`}
              >
                Resources
              </Link>
              <Link 
                to="/how-it-works" 
                className={`text-base font-medium block py-2 ${
                  isActive('/how-it-works') 
                    ? 'text-white border-l-4 border-pink-300 pl-2 font-bold' 
                    : 'text-white hover:text-pink-100'
                }`}
              >
                How It Works
              </Link>
              <Link 
                to="/faq" 
                className={`text-base font-medium block py-2 ${
                  isActive('/faq') 
                    ? 'text-white border-l-4 border-pink-300 pl-2 font-bold' 
                    : 'text-white hover:text-pink-100'
                }`}
              >
                FAQ
              </Link>
              <Link 
                to="/contact" 
                className={`text-base font-medium block py-2 ${
                  isActive('/contact') 
                    ? 'text-white border-l-4 border-pink-300 pl-2 font-bold' 
                    : 'text-white hover:text-pink-100'
                }`}
              >
                Contact
              </Link>
              <Link 
                to="/coming-soon" 
                className={`text-base font-medium block py-2 ${
                  isActive('/coming-soon') 
                    ? 'text-white border-l-4 border-pink-300 pl-2 font-bold' 
                    : 'text-white hover:text-pink-100'
                }`}
              >
                Coming Soon
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}