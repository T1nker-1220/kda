/**
 * Authentication Middleware
 * Handles authentication state and protected routes
 */

import { createServerClient } from '@/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

    // Refresh session if it exists
    const {
      data: { session },
    } = await supabase.auth.getSession()

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

      // Check admin access
      if (isAdminRoute && session.user.user_metadata.role !== 'ADMIN') {
        // Redirect non-admin users to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return response
  } catch (error) {
    // Log error and redirect to login on any error
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
