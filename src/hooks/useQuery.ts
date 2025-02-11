import { queryBuilder } from '@/lib/db/query-builder';
import type { QueryOptions } from '@/lib/db/types';
import type { Database } from '@/types/database.types';
import { useQuery as useReactQuery } from '@tanstack/react-query';

type Tables = Database['public']['Tables'];

/**
 * Custom hook for database queries with caching
 * @param key - Query key for caching
 * @param queryFn - Function that returns the query promise
 * @param options - Query options for caching behavior
 */
export function useQuery<T>(
  key: string[],
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: QueryOptions
) {
  return useReactQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await queryBuilder.query(key, queryFn, options)
      if (error) throw error
      return data
    },
    staleTime: options?.staleTime,
    gcTime: options?.cacheTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    retry: options?.retry
  })
}

/**
 * Hook for fetching a single record by ID
 */
export function useRecord<T extends keyof Tables>(
  table: T,
  id: string | undefined,
  options?: QueryOptions
) {
  return useQuery<Tables[T]['Row']>(
    [table, id!],
    () => queryBuilder.query([table, id!], async () => {
      const { data, error } = await queryBuilder['client']
        .from(table)
        .select('*')
        .eq('id', id!)
        .single()
      return { data, error }
    }),
    {
      ...options,
      staleTime: options?.staleTime,
      cacheTime: options?.cacheTime,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      retry: options?.retry
    }
  )
}

/**
 * Hook for fetching multiple records
 */
export function useRecords<T extends keyof Tables>(
  table: T,
  options?: QueryOptions & {
    filter?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
  }
) {
  return useQuery<Tables[T]['Row'][]>(
    [table, JSON.stringify(options?.filter)],
    async () => {
      let query = queryBuilder['client'].from(table).select('*')

      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      const { data, error } = await query
      return { data, error }
    },
    options
  )
}
