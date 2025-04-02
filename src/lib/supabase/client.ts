/**
 * Client-side Supabase Client Configuration
 * This file sets up the Supabase client for client-side operations.
 * Features:
 * - SSR-safe cookie handling
 * - Environment validation
 * - Type-safe client creation
 */

import { Database } from '@/types/supabase'
import { createBrowserClient } from '@supabase/ssr'

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

// Get Supabase project ref from URL
const getProjectRef = () => {
  const url = getSupabaseUrl()
  const match = url.match(/https:\/\/([^.]+)\./)
  return match ? match[1] : ''
}

// SSR-safe cookie handling functions with enhanced debugging
const cookieHandlers = {
  get(name: string) {
    if (typeof window === 'undefined') return ''
    
    try {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
      const value = match?.[2] || ''
      
      // Debug log for auth-related cookies
      if (name.includes('auth-token')) {
        console.log(`Client cookie get: ${name}, exists: ${!!value}`)
      }
      
      return value
    } catch (e) {
      console.error(`Error getting cookie ${name}:`, e)
      return ''
    }
  },
  
  set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
    if (typeof window === 'undefined') return
    
    try {
      let cookie = `${name}=${value}`
      if (options.path) cookie += `; path=${options.path}`
      if (options.maxAge) cookie += `; max-age=${options.maxAge}`
      if (options.domain) cookie += `; domain=${options.domain}`
      if (options.secure) cookie += '; secure'
      document.cookie = cookie
      
      // Debug log for auth-related cookies
      if (name.includes('auth-token')) {
        console.log(`Client cookie set: ${name}`)
      }
    } catch (e) {
      console.error(`Error setting cookie ${name}:`, e)
    }
  },
  
  remove(name: string, options: { path?: string }) {
    if (typeof window === 'undefined') return
    
    try {
      document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      
      // Debug log for auth-related cookies
      if (name.includes('auth-token')) {
        console.log(`Client cookie removed: ${name}`)
      }
    } catch (e) {
      console.error(`Error removing cookie ${name}:`, e)
    }
  }
}

/**
 * Create an authenticated Supabase client for client-side operations
 * This instance handles session persistence automatically
 */
export const createBrowserSupabaseClient = () => {
  console.log('Creating browser Supabase client')
  try {
    // Get and log project ref to ensure cookie naming is consistent
    const projectRef = getProjectRef()
    console.log('Using project ref for cookies:', projectRef)
    
    return createBrowserClient<Database>(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: cookieHandlers,
        cookieOptions: {
          // Ensure cookies are accessible in the browser
          // and server for better SSR handling
          secure: true,
          sameSite: 'lax',
          path: '/'
        }
      }
    )
  } catch (error) {
    console.error('Failed to create browser Supabase client:', error)
    throw error
  }
}

/**
 * Singleton instance for client-side usage
 * This should be used as the default client throughout the application
 */
export const supabase = createBrowserSupabaseClient()
