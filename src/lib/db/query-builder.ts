import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { QueryClient } from '@tanstack/react-query'
import type { DatabaseError, DbClient, QueryOptions } from './types'

/**
 * Query Builder Class
 * Provides a type-safe way to interact with the database with caching support
 */
export class QueryBuilder {
  private client: DbClient
  private queryClient: QueryClient

  constructor() {
    this.client = createClientComponentClient()
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes
          refetchOnWindowFocus: false,
          retry: 1
        }
      }
    })
  }

  /**
   * Handles database errors in a consistent way
   */
  private handleError(error: unknown): DatabaseError {
    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: error.stack || ''
      }
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: JSON.stringify(error)
    }
  }

  /**
   * Executes a query with error handling and caching
   */
  async query<T>(
    key: string[],
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options?: QueryOptions
  ) {
    try {
      const cachedData = this.queryClient.getQueryData<T>(key)
      if (cachedData) {
        return { data: cachedData, error: null }
      }

      const { data, error } = await queryFn()
      if (error) throw error

      if (data) {
        this.queryClient.setQueryData(key, data)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: this.handleError(error) }
    }
  }

  /**
   * Executes a mutation with error handling
   */
  async mutation<T>(
    mutationFn: () => Promise<{ data: T | null; error: any }>,
    invalidateKeys?: string[][]
  ) {
    try {
      const { data, error } = await mutationFn()
      if (error) throw error

      if (data && invalidateKeys) {
        invalidateKeys.forEach(key => {
          this.queryClient.invalidateQueries({ queryKey: key })
        })
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: this.handleError(error) }
    }
  }

  /**
   * Sets up a real-time subscription
   */
  subscribe<T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    const subscription = this.client
      .channel('db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        callback
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  /**
   * Returns the query client for use in components
   */
  getQueryClient() {
    return this.queryClient
  }
}

// Export a singleton instance
export const queryBuilder = new QueryBuilder()
