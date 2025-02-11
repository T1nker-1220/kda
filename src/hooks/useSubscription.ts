import { queryBuilder } from '@/lib/db/query-builder'
import type { Database } from '@/types/database.types'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

type Tables = Database['public']['Tables']
type RealtimePostgresChangesPayload<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T | null
}

type SubscriptionOptions<T> = {
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
  filter?: string
  enabled?: boolean
}

/**
 * Hook for real-time subscriptions
 */
export function useSubscription<T extends keyof Tables>(
  table: T,
  options: SubscriptionOptions<Tables[T]['Row']> = {}
) {
  const queryClient = useQueryClient()
  const {
    onInsert,
    onUpdate,
    onDelete,
    filter,
    enabled = true
  } = options

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = queryBuilder.subscribe<Tables[T]['Row']>(
      table,
      (payload: RealtimePostgresChangesPayload<Tables[T]['Row']>) => {
        // Handle different event types
        switch (payload.eventType) {
          case 'INSERT':
            queryClient.invalidateQueries({ queryKey: [table] })
            onInsert?.(payload.new)
            break
          case 'UPDATE':
            queryClient.invalidateQueries({ queryKey: [table] })
            onUpdate?.(payload.new)
            break
          case 'DELETE':
            queryClient.invalidateQueries({ queryKey: [table] })
            onDelete?.(payload.old!)
            break
        }
      },
      filter
    )

    return () => {
      unsubscribe()
    }
  }, [table, onInsert, onUpdate, onDelete, filter, enabled, queryClient])
}

/**
 * Hook for subscribing to a specific record
 */
export function useRecordSubscription<T extends keyof Tables>(
  table: T,
  id: string | undefined,
  options: Omit<SubscriptionOptions<Tables[T]['Row']>, 'filter'> = {}
) {
  return useSubscription(table, {
    ...options,
    filter: id ? `id=eq.${id}` : undefined,
    enabled: !!id && options.enabled !== false
  })
}
