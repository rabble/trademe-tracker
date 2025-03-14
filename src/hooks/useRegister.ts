import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to register')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error }
}
