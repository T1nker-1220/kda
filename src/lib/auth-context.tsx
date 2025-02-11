/**
 * Authentication Context Provider
 * Manages authentication state and provides auth-related utilities throughout the application
 * Features:
 * - Google OAuth with PKCE flow
 * - Role-based access control
 * - Session management
 * - Error handling
 */

'use client'

import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type UserRole = Database['public']['Enums']['UserRole']

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error.message)
          return
        }

        if (session) {
          setUser(session.user)
          setRole(session.user.user_metadata.role as UserRole)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setIsLoading(true)
      try {
        if (session) {
          setUser(session.user)
          setRole(session.user.user_metadata.role as UserRole)
        } else {
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Error handling auth change:', error)
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
          skipBrowserRedirect: false, // Let Supabase handle the redirect
        },
      })

      if (error) {
        console.error('Error signing in with Google:', error.message)
        throw error
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
        throw error
      }
      // Clear user and role state
      setUser(null)
      setRole(null)
    } catch (error) {
      console.error('Error in signOut:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
