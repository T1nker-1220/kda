'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client' // Use the singleton client
import { Database } from '@/types/supabase'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  
  useEffect(() => {
    async function getUser() {
      try {
        console.log('Header: Getting user session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Header: Session error:', sessionError)
          return
        }
        
        if (!session) {
          console.log('Header: No session found')
          return
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Header: User error:', userError)
          return
        }
        
        if (user) {
          console.log('Header: User found, getting details from User table')
          // Get user data from our own tables
          const { data, error: dbError } = await supabase
            .from('User')
            .select('email, role')
            .eq('id', user.id)
            .single()
            
          if (dbError) {
            console.error('Header: Error fetching user data:', dbError)
            return
          }
            
          if (data) {
            console.log('Header: User data found:', data.email, data.role)
            setUser(data)
          }
        }
      } catch (e) {
        console.error('Header: Exception in getUser:', e)
      }
    }
    
    getUser()
  }, [])
  
  const handleSignOut = async () => {
    try {
      console.log('Header: Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Header: Sign out error:', error)
      } else {
        console.log('Header: Successfully signed out')
        router.replace('/')
      }
    } catch (e) {
      console.error('Header: Exception during sign out:', e)
    }
  }
  
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      <div></div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
} 