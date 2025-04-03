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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          return
        }
        
        if (!session) {
          return
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          return
        }
        
        if (user) {
          // Get user data from our own tables
          const { data, error: dbError } = await supabase
            .from('User')
            .select('email, role')
            .eq('id', user.id)
            .single()
            
          if (dbError) {
            return
          }
            
          if (data) {
            setUser(data)
          }
        }
      } catch (e) {
        console.error('Exception in getUser:', e)
      }
    }
    
    getUser()
  }, [])
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        router.replace('/')
      }
    } catch (e) {
      console.error('Exception during sign out:', e)
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