import { createClient } from '@supabase/supabase-js'
import { logErrorDetails, logEnvironmentInfo } from './debugUtils'
import type { Database } from './supabase/schema'

// Log environment information on initialization
logEnvironmentInfo()

// Use type assertion to handle Vite environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string

// Log Supabase configuration (without exposing the full key)
console.log('=== SUPABASE CONFIGURATION ===')
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key Available:', !!supabaseAnonKey)
console.log('Supabase Key Length:', supabaseAnonKey?.length || 0)
console.log('Supabase Key Prefix:', supabaseAnonKey?.substring(0, 5) || 'N/A')
console.log('=== END SUPABASE CONFIGURATION ===')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure you have the following in your .env file:')
  console.error('VITE_SUPABASE_URL=your-supabase-url')
  console.error('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Test Supabase connection
;(async () => {
  try {
    console.log('Testing Supabase connection...')
    // Use a simpler query that's less likely to fail
    const { data, error } = await supabase.from('properties').select('count')
    
    if (error) {
      console.error('Supabase connection test failed:')
      logErrorDetails('Supabase Connection Test', error)
    } else {
      console.log('Supabase connection test successful:', data)
    }
  } catch (error) {
    console.error('Unexpected error during Supabase connection test:')
    logErrorDetails('Supabase Connection Test Exception', error)
  }
})()
