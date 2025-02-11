'use client'

/**
 * Dashboard Page
 * Main dashboard view after successful authentication
 * Features:
 * - Welcome message after login
 * - Protected route
 * - Role-based access
 */

import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Show welcome message if redirected from successful auth
    if (searchParams.get('auth_success') === 'true') {
      toast({
        title: 'Welcome back! 👋',
        description: 'Successfully signed in with Google',
        variant: 'success',
      })
    }
  }, [searchParams, toast])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  )
}
