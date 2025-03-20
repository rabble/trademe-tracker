import { FormEvent, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useProgressiveAuth from '../../hooks/useProgressiveAuth'
import { getTempUserId } from '../../lib/tempUserManager'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasTempUserData, setHasTempUserData] = useState(false)
  const [tempPinCount, setTempPinCount] = useState(0)
  
  const { signUp, isTemporaryUser } = useProgressiveAuth()
  
  // Check if user has temporary data
  useEffect(() => {
    const checkTempData = async () => {
      const tempUserId = getTempUserId()
      
      if (tempUserId && isTemporaryUser) {
        setHasTempUserData(true)
        
        // Get count of pins for display
        try {
          const { supabase } = await import('../../lib/supabase')
          await supabase.rpc('set_temp_user_id', { p_temp_user_id: tempUserId })
          
          const { data, error } = await supabase
            .from('property_pins')
            .select('id', { count: 'exact' })
            .eq('temp_user_id', tempUserId)
          
          if (!error && data) {
            setTempPinCount(data.length)
          }
        } catch (err) {
          console.error('Error fetching temp user pin count:', err)
        }
      }
    }
    
    checkTempData()
  }, [isTemporaryUser])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setPasswordError(null)
    setError(null)
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }
    
    // Check password strength
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }
    
    setLoading(true)
    
    try {
      console.log('Registration attempt with:', { email })
      const result = await signUp(email, password)
      console.log('Registration successful, redirecting to dashboard')
      
      // Force navigation to dashboard
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {/* Show message if user has temporary data */}
        {hasTempUserData && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Great news!</span> You have {tempPinCount} {tempPinCount === 1 ? 'property' : 'properties'} saved. Creating an account will preserve them and allow you to access them from any device.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          {passwordError && (
            <div className="text-red-500 text-sm">{passwordError}</div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : hasTempUserData ? 'Create account & save my properties' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
