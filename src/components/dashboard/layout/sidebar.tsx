'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutGrid, 
  Layers, 
  ShoppingCart, 
  Users, 
  Settings, 
  Home 
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  title: string
  href: string
  icon: React.ReactNode
}

export function Sidebar() {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />
    },
    {
      title: 'Categories',
      href: '/dashboard/categories',
      icon: <Layers className="h-5 w-5" />
    },
    {
      title: 'Products',
      href: '/dashboard/products',
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: <LayoutGrid className="h-5 w-5" />
    },
    {
      title: 'Customers',
      href: '/dashboard/customers',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ]
  
  return (
    <aside className="fixed top-0 left-0 z-30 h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900 dark:text-white">Kusina de Amadeo</span>
        </Link>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
} 