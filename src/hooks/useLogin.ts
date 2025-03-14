import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to log in')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
}
