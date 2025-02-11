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
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  return key
}

/**
 * Create an authenticated Supabase client for server-side operations
 * This instance handles cookie management for SSR
 */
export const createServerClient = () => {
  const cookieStore = cookies()

  return createServerClientBase<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies.set error in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Handle cookies.delete error in middleware
          }
        },
      },
    }
  )
}
