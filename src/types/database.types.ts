export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          role: 'ADMIN' | 'CUSTOMER'
          email: string
          address: string
          fullName: string
          createdAt: string
          updatedAt: string
          phoneNumber: string
        }
        Insert: {
          id: string
          role?: 'ADMIN' | 'CUSTOMER'
          email: string
          address?: string
          fullName: string
          createdAt?: string
          updatedAt?: string
          phoneNumber?: string
        }
        Update: {
          id?: string
          role?: 'ADMIN' | 'CUSTOMER'
          email?: string
          address?: string
          fullName?: string
          createdAt?: string
          updatedAt?: string
          phoneNumber?: string
        }
      }
      Order: {
        Row: {
          id: string
          userId: string
          status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          total: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          userId: string
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          total: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          total?: number
          createdAt?: string
          updatedAt?: string
        }
      }
      Payment: {
        Row: {
          id: string
          orderId: string
          status: 'PENDING' | 'VERIFIED' | 'REJECTED'
          method: 'GCASH' | 'CASH'
          amount: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          orderId: string
          status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          method: 'GCASH' | 'CASH'
          amount: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          method?: 'GCASH' | 'CASH'
          amount?: number
          createdAt?: string
          updatedAt?: string
        }
      }
      Product: {
        Row: {
          id: string
          name: string
          imageUrl: string
          basePrice: number
          categoryId: string
          description: string
          isAvailable: boolean
          allowsAddons: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          imageUrl: string
          basePrice: number
          categoryId: string
          description: string
          isAvailable?: boolean
          allowsAddons?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          imageUrl?: string
          basePrice?: number
          categoryId?: string
          description?: string
          isAvailable?: boolean
          allowsAddons?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
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
          updatedAt?: string
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
      GlobalAddon: {
        Row: {
          id: string
          name: string
          price: number
          isAvailable: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          price: number
          isAvailable?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          isAvailable?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      ProductVariant: {
        Row: {
          id: string
          name: string
          type: 'SIZE' | 'FLAVOR'
          price: number
          stock: number
          imageUrl: string | null
          productId: string
          isAvailable: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          type: 'SIZE' | 'FLAVOR'
          price: number
          stock: number
          imageUrl?: string | null
          productId: string
          isAvailable?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'SIZE' | 'FLAVOR'
          price?: number
          stock?: number
          imageUrl?: string | null
          productId?: string
          isAvailable?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      OrderItem: {
        Row: {
          id: string
          orderId: string
          productId: string
          variantId: string | null
          quantity: number
          price: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          orderId: string
          productId: string
          variantId?: string | null
          quantity: number
          price: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          productId?: string
          variantId?: string | null
          quantity?: number
          price?: number
          createdAt?: string
          updatedAt?: string
        }
      }
      OrderItemAddon: {
        Row: {
          id: string
          orderItemId: string
          addonId: string
          quantity: number
          price: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          orderItemId: string
          addonId: string
          quantity: number
          price: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          orderItemId?: string
          addonId?: string
          quantity?: number
          price?: number
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
        Args: Record<string, never>
        Returns: Json
      }
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: void
      }
    }
  }
}

// Helper types for better DX
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
