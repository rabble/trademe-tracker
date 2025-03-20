import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface LightMarketingNavProps {
  activePage?: 'contact' | 'coming-soon' | string;
}

/**
 * LightMarketingNav - Light themed navigation component for pages without hero images
 * Used on pages with light backgrounds that need dark text
 * Contains responsive mobile menu with hamburger toggle
 * Automatically highlights the current page in the navigation (also supports prop-based activation)
 */
export function LightMarketingNav({ activePage }: LightMarketingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  // Function to determine if a link is active (prioritizes prop if provided)
  const isActive = (path: string): boolean => {
    // If activePage prop is provided, use it for specified pages
    if (activePage) {
      if (path === '/contact' && activePage === 'contact') return true;
      if (path === '/coming-soon' && activePage === 'coming-soon') return true;
    }
    // Otherwise use the current path
    return currentPath === path;
  }

  return (
    <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4" aria-label="Global">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex">
          <Link to="/">
            <span className="sr-only">MiVoy</span>
            <h1 className="text-2xl font-bold text-gray-900">MiVoy</h1>
          </Link>
        </div>
        
        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          <Link 
            to="/about" 
            className={`text-base font-medium ${
              isActive('/about') ? 'text-gray-900 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            About
          </Link>
          <Link 
            to="/resources" 
            className={`text-base font-medium ${
              isActive('/resources') ? 'text-gray-900 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Resources
          </Link>
          <Link 
            to="/how-it-works" 
            className={`text-base font-medium ${
              isActive('/how-it-works') ? 'text-gray-900 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            How It Works
          </Link>
          <Link 
            to="/faq" 
            className={`text-base font-medium ${
              isActive('/faq') ? 'text-gray-900 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            FAQ
          </Link>
          <Link 
            to="/contact" 
            className={`text-base font-medium ${
              isActive('/contact') ? 'text-gray-900 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Contact
          </Link>
          <Link 
            to="/coming-soon" 
            className={`text-base font-medium ${
              isActive('/coming-soon') ? 'text-gray-900 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Coming Soon
          </Link>
        </div>
        
        {/* Spacer - pushes sign in to the right */}
        <div className="flex-grow"></div>
        
        {/* Sign In Button and Mobile Menu Toggle */}
        <div className="flex items-center">
          <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600">
            Sign in
          </Link>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
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
        <div className="md:hidden mt-4 rounded-lg bg-white bg-opacity-95 shadow-lg ring-1 ring-black ring-opacity-5 p-4">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/about" 
              className={`text-base font-medium block py-2 ${
                isActive('/about') 
                  ? 'text-gray-900 border-l-4 border-pink-500 pl-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              About
            </Link>
            <Link 
              to="/resources" 
              className={`text-base font-medium block py-2 ${
                isActive('/resources') 
                  ? 'text-gray-900 border-l-4 border-pink-500 pl-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Resources
            </Link>
            <Link 
              to="/how-it-works" 
              className={`text-base font-medium block py-2 ${
                isActive('/how-it-works') 
                  ? 'text-gray-900 border-l-4 border-pink-500 pl-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/faq" 
              className={`text-base font-medium block py-2 ${
                isActive('/faq') 
                  ? 'text-gray-900 border-l-4 border-pink-500 pl-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              FAQ
            </Link>
            <Link 
              to="/contact" 
              className={`text-base font-medium block py-2 ${
                isActive('/contact') 
                  ? 'text-gray-900 border-l-4 border-pink-500 pl-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/coming-soon" 
              className={`text-base font-medium block py-2 ${
                isActive('/coming-soon') 
                  ? 'text-gray-900 border-l-4 border-pink-500 pl-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Coming Soon
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}