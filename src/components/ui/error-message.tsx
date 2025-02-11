/**
 * Error Message Component
 * Displays error messages with proper styling and accessibility
 */

import { cn } from '@/lib/utils'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  variant?: 'default' | 'destructive'
}

export function ErrorMessage({
  message,
  variant = 'default',
  className,
  ...props
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-md p-3 text-sm',
        {
          'bg-destructive/15 text-destructive': variant === 'destructive',
          'bg-muted text-muted-foreground': variant === 'default',
        },
        className
      )}
      {...props}
    >
      <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
