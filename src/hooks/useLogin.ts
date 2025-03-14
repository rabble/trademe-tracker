import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting to sign in with Supabase:', { email })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('Supabase auth response:', { data, error })
      
      if (error) {
        throw error
      }
      
      if (!data.user) {
        throw new Error('No user returned from authentication')
      }
      
      return { success: true, user: data.user }
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
