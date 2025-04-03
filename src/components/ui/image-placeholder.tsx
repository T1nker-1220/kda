import React from 'react'
import { ImageIcon, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'image' | 'drink'
}

export function ImagePlaceholder({
  size = 'md',
  text = 'No image',
  variant = 'image',
  className,
  ...props
}: ImagePlaceholderProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  return (
    <div
      className={cn(
        'bg-muted flex flex-col items-center justify-center text-xs text-muted-foreground rounded-md border border-border',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {variant === 'image' ? (
        <ImageIcon className="h-6 w-6 mb-1 opacity-50" />
      ) : (
        <Coffee className="h-6 w-6 mb-1 opacity-50" />
      )}
      {text && <span>{text}</span>}
    </div>
  )
} 