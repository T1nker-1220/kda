'use client'

/**
 * Login Page
 * Handles user authentication with Supabase Google OAuth
 * Features:
 * - Google OAuth sign in
 * - Loading states during authentication
 * - Popup blocking detection
 * - Error handling
 * - Welcome message toast
 * - Accessibility support
 */

import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGoogle } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPopupBlocked, setIsPopupBlocked] = useState(false)

  // Handle OAuth callback error
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setError(error)
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setIsPopupBlocked(false)

      // Attempt to open popup
      const popup = window.open('about:blank', 'google-login', 'width=500,height=600')
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setIsPopupBlocked(true)
        setIsLoading(false)
        return
      }
      popup.close()

      await signInWithGoogle()

      toast({
        title: 'Welcome back! 👋',
        description: 'Successfully signed in with Google',
        variant: 'success',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('An unexpected error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="text-sm text-muted-foreground">
        Sign in to your account to continue
      </p>

      {error && (
        <ErrorMessage
          message={error}
          className="animate-in fade-in-50"
        />
      )}

      {isPopupBlocked && (
        <ErrorMessage
          message="Please enable popups to continue with Google sign in"
          className="animate-in fade-in-50"
        />
      )}

      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full max-w-sm"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Signing in...
          </>
        ) : (
          <>
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Continue with Google
          </>
        )}
      </Button>
    </div>
  )
}
