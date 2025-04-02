/**
 * Server-side Supabase Client Configuration
 * This file sets up the Supabase client for server-side operations.
 */

import { Database } from '@/types/supabase'
import { createServerClient as createServerClientBase, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Environment variables are validated at runtime
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  console.log('Using Supabase URL:', url)
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  console.log('Supabase anon key available:', key.substring(0, 10) + '...')
  return key
}

/**
 * Create an authenticated Supabase client for server-side operations
 * This instance handles cookie management for SSR
 */
export const createServerClient = () => {
  try {
    console.log('Creating server-side Supabase client')
    const cookieStore = cookies()
    
    // Debugging cookie information - check for Supabase auth cookies with proper naming pattern
    try {
      // Get project ref from URL (example: heylcozpqbrpyjxkfzzz)
      const supabaseUrl = getSupabaseUrl()
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || ''
      
      // Log all cookies to debug
      const allCookies = cookieStore.getAll().map(c => c.name)
      console.log('All cookies:', allCookies)
      
      // Check for Supabase auth token cookies with correct naming pattern
      const authCookies = cookieStore.getAll().filter(c => 
        c.name.startsWith(`sb-${projectRef}-auth-token`)
      )
      
      console.log('Auth token cookies found:', authCookies.length > 0)
      authCookies.forEach(c => console.log(`Found auth cookie: ${c.name}`))
    } catch (e) {
      console.error('Error accessing cookies:', e)
    }

    const client = createServerClientBase<Database>(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          get(name: string) {
            try {
              const cookie = cookieStore.get(name)
              console.log(`Getting cookie: ${name}, exists: ${!!cookie}`)
              return cookie?.value
            } catch (error) {
              console.error(`Error getting cookie ${name}:`, error)
              return undefined
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
              console.log(`Cookie ${name} set successfully`)
            } catch (error) {
              console.error(`Error setting cookie ${name}:`, error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
              console.log(`Cookie ${name} removed successfully`)
            } catch (error) {
              console.error(`Error removing cookie ${name}:`, error)
            }
          },
        },
      }
    )
    
    console.log('Server-side Supabase client created successfully')
    return client
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw error
  }
}
