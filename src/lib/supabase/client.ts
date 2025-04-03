'use client'

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

// Get the Supabase project reference from the URL for cookie naming consistency
const getProjectRef = () => {
  const url = getSupabaseUrl()
  return url.match(/https:\/\/([^.]+)\./)?.[1] || ''
}

// Define consistent cookie handlers for browser-side operations
const cookieHandlers = {
  // Get cookie value from document.cookie
  get(name: string) {
    // Document not available during SSR
    if (typeof document === 'undefined') return null
    
    const cookies = Object.fromEntries(
      document.cookie.split('; ').map(v => {
        const [key, ...value] = v.split('=')
        return [key, value.join('=')]
      })
    )
    return cookies[name]
  },

  // Set cookie on document.cookie
  set(name: string, value: string, options: any) {
    // Document not available during SSR
    if (typeof document === 'undefined') return

    // Convert options object to cookie string
    let cookieValue = `${name}=${value}`
    
    if (options.expires) {
      cookieValue += `; expires=${options.expires.toUTCString()}`
    }
    if (options.path) {
      cookieValue += `; path=${options.path}`
    }
    if (options.domain) {
      cookieValue += `; domain=${options.domain}`
    }
    if (options.sameSite) {
      cookieValue += `; samesite=${options.sameSite}`
    }
    if (options.secure) {
      cookieValue += '; secure'
    }
    
    document.cookie = cookieValue
  },

  // Remove cookie by setting expiration to past date
  remove(name: string, options: any) {
    // Document not available during SSR
    if (typeof document === 'undefined') return

    // Set expiration to past date to delete cookie
    const deleteCookie = {
      ...options,
      expires: new Date(0),
    }
    
    // Use set method with expired date
    this.set(name, '', deleteCookie)
  },
}

/**
 * Create an authenticated Supabase client for client-side operations
 * This instance handles session persistence automatically
 */
export const createBrowserSupabaseClient = () => {
  try {
    // Get project ref to ensure cookie naming is consistent
    const projectRef = getProjectRef()
    
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

// Export singleton instance for use throughout the application
export const supabase = createBrowserSupabaseClient()
