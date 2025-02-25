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
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout')
    } finally {
      setLoading(false)
    }
  }

  return { logout, loading, error }
}
