import { queryBuilder } from '@/lib/db/query-builder'
import type { Database } from '@/types/database.types'
import { useQueryClient, useMutation as useReactMutation } from '@tanstack/react-query'

type Tables = Database['public']['Tables']
type MutationOptions = {
  invalidateQueries?: string[][]
  onSuccess?: () => void
  onError?: (error: any) => void
}

/**
 * Hook for creating a new record
 */
export function useCreate<T extends keyof Tables>(
  table: T,
  options?: MutationOptions
) {
  const queryClient = useQueryClient()

  return useReactMutation({
    mutationFn: async (data: Tables[T]['Insert']) => {
      const { data: result, error } = await queryBuilder['client']
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result as Tables[T]['Row']
    },
    onSuccess: () => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
      options?.onSuccess?.()
    },
    onError: options?.onError
  })
}

/**
 * Hook for updating an existing record
 */
export function useUpdate<T extends keyof Tables>(
  table: T,
  options?: MutationOptions
) {
  const queryClient = useQueryClient()

  return useReactMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string
      data: Tables[T]['Update']
    }) => {
      const { data: result, error } = await queryBuilder['client']
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result as Tables[T]['Row']
    },
    onSuccess: () => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
      options?.onSuccess?.()
    },
    onError: options?.onError
  })
}

/**
 * Hook for deleting a record
 */
export function useDelete<T extends keyof Tables>(
  table: T,
  options?: MutationOptions
) {
  const queryClient = useQueryClient()

  return useReactMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await queryBuilder['client']
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result as Tables[T]['Row']
    },
    onSuccess: () => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
      options?.onSuccess?.()
    },
    onError: options?.onError
  })
}
