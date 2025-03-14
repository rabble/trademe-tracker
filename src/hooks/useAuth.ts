import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getCurrentUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
      setLoading(false)
    }

    getCurrentUser()

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authSubscription.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
