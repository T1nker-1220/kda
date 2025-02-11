import { Database, Tables } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type DbClient = SupabaseClient<Database>

export type QueryOptions = {
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  retry?: number | boolean
}

export type DatabaseError = {
  code: string
  message: string
  details: string
}

export type QueryResult<T> = Promise<{
  data: T | null
  error: DatabaseError | null
}>

export type MutationResult<T> = Promise<{
  data: T | null
  error: DatabaseError | null
}>

export type SubscriptionCallback<T> = (payload: {
  new: T
  old: T | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

// Table-specific types
export type User = Tables<'User'>
export type Order = Tables<'Order'>
export type Payment = Tables<'Payment'>
export type Product = Tables<'Product'>
export type Category = Tables<'Category'>
export type GlobalAddon = Tables<'GlobalAddon'>
export type ProductVariant = Tables<'ProductVariant'>
export type OrderItem = Tables<'OrderItem'>
export type OrderItemAddon = Tables<'OrderItemAddon'>
