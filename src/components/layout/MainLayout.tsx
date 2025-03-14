import { useAuth } from '../../hooks/useAuth'
import { useLogout } from '../../hooks/useLogout'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

export function MainLayout() {
  const { user } = useAuth()
  const { logout, loading: logoutLoading } = useLogout()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            TradeMe Property Tracker
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

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white shadow-sm md:min-h-[calc(100vh-4rem)] md:fixed">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-x-hidden py-3 md:py-5 px-4">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/') 
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
        <main className="flex-1 md:ml-64 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
