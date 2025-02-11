/**
 * OAuth Callback Handler
 * This route handles the OAuth callback from Supabase authentication
 * Features:
 * - Code exchange for session with PKCE
 * - Error handling
 * - Proper redirects
 * - Role-based access setup
 * - Success message handling
 */

import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
      )
    }

    // Validate code
    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Missing authentication code`
      )
    }

    // Create server client
    const supabase = createServerClient()

    // Exchange code for session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Auth callback error:', exchangeError.message)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    if (!session) {
      console.error('No session created')
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Authentication failed`
      )
    }

    // Set default role for new users if not set
    if (!session.user.user_metadata.role) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: 'CUSTOMER' }
      })

      if (updateError) {
        console.error('Error setting default role:', updateError.message)
        // Continue despite role setting error - user can still access basic features
      }
    }

    // Add success message to the redirect URL
    const redirectUrl = new URL(next, requestUrl.origin)
    redirectUrl.searchParams.set('auth_success', 'true')

    // Create the response with the redirect
    const response = NextResponse.redirect(redirectUrl)

    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Unexpected authentication error`
    )
  }
}
