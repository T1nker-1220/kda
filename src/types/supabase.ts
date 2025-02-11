/**
 * Generated Types for Supabase Database
 * These types are manually generated based on our database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Category: {
        Row: {
          id: string
          name: string
          description: string
          imageUrl: string
          sortOrder: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          description: string
          imageUrl: string
          sortOrder: number
          createdAt?: string
          updatedAt: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          imageUrl?: string
          sortOrder?: number
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Enums: {
      UserRole: 'ADMIN' | 'CUSTOMER'
      OrderStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
      PaymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
      PaymentMethod: 'GCASH' | 'CASH'
      VariantType: 'SIZE' | 'FLAVOR'
    }
    Functions: {
      get_database_state: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      exec_sql: {
        Args: { sql: string }
        Returns: undefined
      }
    }
  }
}
