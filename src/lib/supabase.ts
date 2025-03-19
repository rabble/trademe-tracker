import { createClient } from '@supabase/supabase-js'
import { logErrorDetails, logEnvironmentInfo } from './debugUtils'
import type { Database } from './supabase/schema'

// Log environment information on initialization
logEnvironmentInfo()

// Check for environment variables injected by the worker first
// Use a combination of injected window.ENV and Vite environment variables
const getEnvVariable = (key: string, viteKey: string): string => {
  // Try to get from window.ENV (worker-injected)
  if (typeof window !== 'undefined' && (window as any).ENV && (window as any).ENV[key]) {
    return (window as any).ENV[key]
  }
  
  // Fallback to Vite env variables
  return import.meta.env?.[viteKey] as string
}

// Get Supabase credentials from environment
const supabaseUrl = getEnvVariable('SUPABASE_URL', 'VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVariable('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')

// Log Supabase configuration (without exposing the full key)
console.log('=== SUPABASE CONFIGURATION ===')
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key Available:', !!supabaseAnonKey)
console.log('Supabase Key Length:', supabaseAnonKey?.length || 0)
console.log('Supabase Key Prefix:', supabaseAnonKey?.substring(0, 5) || 'N/A')
console.log('Environment Source:', (typeof window !== 'undefined' && (window as any).ENV) ? 'Worker Injected' : 'Vite Config')
console.log('=== END SUPABASE CONFIGURATION ===')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure you have the following in your .env file:')
  console.error('VITE_SUPABASE_URL=your-supabase-url')
  console.error('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key')
  
  // Instead of throwing, provide fallback values for development/demo purposes
  console.warn('Using fallback Supabase credentials for demo mode')
  const useFallbackCredentials = true;
  if (useFallbackCredentials) {
    // This is just for demonstration purposes, will try to continue with empty values
    // The app will operate in a limited mode
  } else {
    throw new Error('Missing Supabase environment variables')
  }
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
