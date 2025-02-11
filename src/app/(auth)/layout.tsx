/**
 * Authentication Layout
 * This layout wraps all authentication-related pages
 * and provides dark mode support with theme toggle
 */

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Left Section - Auth Form */}
      <div className="col-span-1 flex flex-col justify-between p-8">
        {/* Logo and Theme Toggle */}
        <div className="flex items-center justify-between">
          <Image
            src="/images/logo.png"
            alt="Kusina de Amadeo"
            width={50}
            height={33}
            className="dark:brightness-100" // Ensure logo is visible in dark mode
            priority
          />
          <ThemeToggle />
        </div>

        {/* Auth Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Kusina de Amadeo. All rights reserved.
        </div>
      </div>

      {/* Right Section - Hero Image */}
      <div className={cn(
        'hidden md:block md:col-span-1 lg:col-span-2 bg-muted',
        'relative overflow-hidden'
      )}>
        <div className="absolute inset-0">
          <Image
            src="/images/auth-hero.jpg"
            alt="Authentic Filipino Cuisine"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
        </div>
        <div className="relative h-full flex items-center justify-center p-8">
          <div className="max-w-2xl text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome to Kusina de Amadeo
            </h1>
            <p className="text-lg text-white/90">
              Experience authentic Filipino cuisine in the heart of Amadeo, Cavite
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
