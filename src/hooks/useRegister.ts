import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting to register with Supabase:', { email })
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      console.log('Supabase registration response:', { data, error })
      
      if (error) {
        throw error
      }
      
      if (!data.user) {
        throw new Error('No user returned from registration')
      }
      
      // Check if email confirmation is required
      if (data.user.identities?.length === 0) {
        return { 
          success: true, 
          user: data.user,
          message: 'Please check your email for a confirmation link'
        }
      }
      
      return { success: true, user: data.user }
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
