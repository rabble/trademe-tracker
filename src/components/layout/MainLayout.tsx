import { useAuth } from '../../hooks/useAuth'
import { useLogout } from '../../hooks/useLogout'
import { Link } from 'react-router-dom'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { logout, loading: logoutLoading } = useLogout()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            TradeMe Property Tracker
          </h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">{user?.email}</span>
            <button
              onClick={() => logout()}
              disabled={logoutLoading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {logoutLoading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] fixed">
          <nav className="mt-5 px-2">
            <Link
              to="/"
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              to="/properties"
              className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Properties
            </Link>
            <Link
              to="/settings"
              className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
