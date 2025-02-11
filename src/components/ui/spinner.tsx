/**
 * Loading Spinner Component
 * A customizable loading spinner with proper accessibility
 * and dark mode support
 */

import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary'
}

export function Spinner({
  size = 'md',
  variant = 'default',
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', className)}
      {...props}
    >
      <div
        className={cn(
          'rounded-full border-2',
          {
            'w-4 h-4 border-2': size === 'sm',
            'w-8 h-8 border-3': size === 'md',
            'w-12 h-12 border-4': size === 'lg',
          },
          {
            'border-muted-foreground/20 border-t-muted-foreground': variant === 'default',
            'border-primary/20 border-t-primary': variant === 'primary',
          }
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
