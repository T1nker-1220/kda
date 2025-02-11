/**
 * Authentication Middleware
 * Handles authentication state and protected routes with Supabase
 * Features:
 * - Route protection
 * - Role-based access control
 * - Error handling
 * - Proper redirects
 */

import { createServerClient } from '@/lib/supabase'
import { type Database } from '@/types/supabase'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/orders']
// Define admin-only routes
const adminRoutes = ['/dashboard/admin']

export async function middleware(request: NextRequest) {
  try {
    // Create a response with the CORS headers
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient()

    // Get session and user role
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError.message)
      throw new Error('Authentication failed')
    }

    const pathname = request.nextUrl.pathname

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

    // Update response headers if needed
    response.headers.set('x-user-role', session?.user.user_metadata.role || 'none')

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Redirect to login with error message
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', 'Authentication failed')
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
