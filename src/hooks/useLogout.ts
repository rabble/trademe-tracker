import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLogout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('Logout error:', err)
      setError(err.message || 'Failed to log out')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { logout, loading, error }
}
