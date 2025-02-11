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

import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Missing authentication code`
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient()

    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
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
      }
    }

    // Add success message to the redirect URL
    const redirectUrl = new URL(next, requestUrl.origin)
    redirectUrl.searchParams.set('auth_success', 'true')

    // Redirect to the intended destination
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Unexpected error in callback:', error)
    return NextResponse.redirect(
      `${new URL(request.url).origin}/login?error=Unexpected error occurred`
    )
  }
}
