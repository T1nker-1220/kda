/**
 * Authentication Error Page
 * Displays error messages for authentication failures
 * with proper error handling and user guidance
 */

'use client'

import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const errorMessages: { [key: string]: string } = {
    'Authentication failed': 'Authentication failed. Please try again.',
    'Access denied': 'You do not have permission to access this page.',
    default: 'An error occurred. Please try again.',
  }

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Authentication Error
        </h1>
        <p className="text-sm text-muted-foreground">
          We encountered an issue while trying to authenticate you
        </p>
      </div>

      <ErrorMessage
        message={message}
        variant="destructive"
      />

      <div className="space-y-4">
        <Button
          variant="default"
          className="w-full"
          onClick={() => router.push('/login')}
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/')}
        >
          Return Home
        </Button>
      </div>
    </div>
  )
}
