'use client'

/**
 * Dashboard Page
 * Main dashboard view after successful authentication
 * Features:
 * - Welcome message after login
 * - Protected route
 * - Role-based access
 * - Links to admin functions
 */

import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart4, Layers, ShoppingCart, Users } from 'lucide-react'
import Link from 'next/link'

// Admin function card component
function AdminFunctionCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: React.ReactNode 
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-all hover:border-slate-300 hover:shadow-md dark:hover:border-slate-600">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

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

  // Admin functions data
  const adminFunctions = [
    {
      title: 'Categories',
      description: 'Manage food categories and their organization',
      href: '/dashboard/categories',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: 'Products',
      description: 'Add, edit, and remove menu items',
      href: '/dashboard/products',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      href: '/dashboard/orders',
      icon: <BarChart4 className="h-5 w-5" />,
    },
    {
      title: 'Customers',
      description: 'View customer information and history',
      href: '/dashboard/customers',
      icon: <Users className="h-5 w-5" />,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your restaurant's content and operations
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {adminFunctions.map((item) => (
          <AdminFunctionCard
            key={item.href}
            title={item.title}
            description={item.description}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  )
}
