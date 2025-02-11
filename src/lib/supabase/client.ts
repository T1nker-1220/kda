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

// SSR-safe cookie handling functions
const cookieHandlers = {
  get(name: string) {
    if (typeof window === 'undefined') return ''
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match?.[2] || ''
  },
  set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
    if (typeof window === 'undefined') return
    let cookie = `${name}=${value}`
    if (options.path) cookie += `; path=${options.path}`
    if (options.maxAge) cookie += `; max-age=${options.maxAge}`
    if (options.domain) cookie += `; domain=${options.domain}`
    if (options.secure) cookie += '; secure'
    document.cookie = cookie
  },
  remove(name: string, options: { path?: string }) {
    if (typeof window === 'undefined') return
    document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

/**
 * Create an authenticated Supabase client for client-side operations
 * This instance handles session persistence automatically
 */
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: cookieHandlers
    }
  )
}

/**
 * Singleton instance for client-side usage
 * This should be used as the default client throughout the application
 */
export const supabase = createBrowserSupabaseClient()
