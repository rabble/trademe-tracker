import { useAuth } from '../../hooks/useAuth'
import { useLogout } from '../../hooks/useLogout'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { MultiplePinsReminder } from '../auth'
import useProgressiveAuth from '../../hooks/useProgressiveAuth'

export function MainLayout() {
  const { user } = useAuth()
  const { logout, loading: logoutLoading } = useLogout()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useProgressiveAuth()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            MiVoy
            <span className="block text-xs text-gray-500 font-normal">Property Insights Platform</span>
          </h1>
          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline">{user?.email}</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={async () => {
                      const result = await logout()
                      if (result?.success) {
                        // Auth state change will handle redirect
                        console.log('Logout successful')
                      }
                      setUserMenuOpen(false)
                    }}
                    disabled={logoutLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {logoutLoading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progressive login nudges */}
      {!isAuthenticated && <MultiplePinsReminder pinThreshold={3} />}
      
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white shadow-sm md:min-h-[calc(100vh-4rem)] md:fixed">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-x-hidden py-3 md:py-5 px-4">
            <Link
              to="/dashboard"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/dashboard') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } md:w-full md:mb-1`}
            >
              Dashboard
            </Link>
            <Link
              to="/properties"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/properties') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } md:w-full md:mb-1 ml-2 md:ml-0`}
            >
              Properties
            </Link>
            <Link
              to="/import-property"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/import-property') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } md:w-full md:mb-1 ml-2 md:ml-0`}
            >
              Import Property
            </Link>
            <Link
              to="/trademe-search"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/trademe-search') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } md:w-full md:mb-1 ml-2 md:ml-0`}
            >
              TradeMe Search
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/settings') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } md:w-full md:mb-1 ml-2 md:ml-0`}
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-64 flex flex-col">
          <main className="flex-1 p-4">
            <Outlet />
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-6 md:ml-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} MiVoy Property Insights. All rights reserved.
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-4">
                <Link to="/about#privacy" className="text-sm text-gray-500 hover:text-gray-700">
                  Privacy Policy
                </Link>
                <Link to="/about#terms" className="text-sm text-gray-500 hover:text-gray-700">
                  Terms of Service
                </Link>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-700">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
