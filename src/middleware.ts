/**
 * Authentication Middleware
 * Handles authentication state and protected routes with Supabase
 * Features:
 * - Route protection
 * - Role-based access control
 * - Error handling
 * - Proper redirects
 */

import { createServerClient } from '@/lib/supabase/server'
import { type Database } from '@/types/supabase'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/orders']
// Define admin-only routes
const adminRoutes = ['/dashboard/admin']

// Define public routes that don't need auth
const publicRoutes = ['/', '/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  try {
    // Create a response with the CORS headers
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Debug cookie information
    const cookieStore = cookies()
    
    // Get Supabase project ref from environment URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || ''
    
    // Look specifically for Supabase auth cookies
    const authCookies = cookieStore.getAll().filter(c => 
      c.name.startsWith(`sb-${projectRef}-auth-token`)
    )

    // Create supabase client
    const supabase = createServerClient()

    // Refresh session if available
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const pathname = request.nextUrl.pathname

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return response
    }

    // Handle session errors
    if (sessionError) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'Session expired')
      return NextResponse.redirect(redirectUrl)
    }

    // Check if it's a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    // Handle authentication logic
    if (isProtectedRoute || isAdminRoute) {
      if (!session) {
        // Redirect to login if not authenticated
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Get user role from metadata
      const userRole = session.user.user_metadata.role as Database['public']['Enums']['UserRole']

      // Check admin access
      if (isAdminRoute && userRole !== 'ADMIN') {
        // Redirect non-admin users to home with error
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('error', 'Access denied')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Redirect to login with error on any unexpected errors
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', 'Authentication error')
    return NextResponse.redirect(redirectUrl)
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
