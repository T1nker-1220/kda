/**
 * Supabase Client Configuration
 * This file sets up the Supabase client with proper configuration and types.
 * It provides both server and client-side instances with appropriate settings.
 */

import { Database } from '@/types/supabase'
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Environment variables are validated at runtime
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  return key
}

/**
 * Create an authenticated Supabase client for server-side operations
 */
export const createServerClient = () => {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: false,
      }
    }
  )
}

/**
 * Create an authenticated Supabase client for client-side operations
 * This instance handles session persistence automatically
 */
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  )
}

/**
 * Singleton instance for client-side usage
 * This should be used as the default client throughout the application
 */
export const supabase = createBrowserSupabaseClient()
