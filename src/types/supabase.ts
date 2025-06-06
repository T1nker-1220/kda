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
      Order: {
        Row: {
          id: string
          userId: string
          receiptId: string
          status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          paymentMethod: 'GCASH' | 'CASH'
          paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
          totalAmount: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          userId: string
          receiptId: string
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          paymentMethod: 'GCASH' | 'CASH'
          paymentStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          totalAmount: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          receiptId?: string
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          paymentMethod?: 'GCASH' | 'CASH'
          paymentStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          totalAmount?: number
          createdAt?: string
          updatedAt?: string
        }
      }
      OrderItem: {
        Row: {
          id: string
          orderId: string
          productId: string
          productVariantId: string | null
          quantity: number
          price: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          orderId: string
          productId: string
          productVariantId?: string | null
          quantity: number
          price: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          productId?: string
          productVariantId?: string | null
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
          unitPrice: number
          subtotal: number
        }
        Insert: {
          id: string
          orderItemId: string
          addonId: string
          quantity: number
          unitPrice: number
          subtotal: number
        }
        Update: {
          id?: string
          orderItemId?: string
          addonId?: string
          quantity?: number
          unitPrice?: number
          subtotal?: number
        }
      }
      Payment: {
        Row: {
          id: string
          orderId: string
          amount: number
          method: 'GCASH' | 'CASH'
          status: 'PENDING' | 'VERIFIED' | 'REJECTED'
          referenceNumber?: string
          screenshotUrl?: string
          verifiedBy?: string
          verificationTimestamp?: string
          notes?: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          orderId: string
          amount: number
          method: 'GCASH' | 'CASH'
          status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          referenceNumber?: string
          screenshotUrl?: string
          verifiedBy?: string
          verificationTimestamp?: string
          notes?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          amount?: number
          method?: 'GCASH' | 'CASH'
          status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          referenceNumber?: string
          screenshotUrl?: string
          verifiedBy?: string
          verificationTimestamp?: string
          notes?: string
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
          variantGroup: string
          displayOrder: number
          isDefault: boolean
          originalName: string | null
          sizeValue: string | null
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
          variantGroup?: string
          displayOrder?: number
          isDefault?: boolean
          originalName?: string | null
          sizeValue?: string | null
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
          variantGroup?: string
          displayOrder?: number
          isDefault?: boolean
          originalName?: string | null
          sizeValue?: string | null
        }
      }
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
    }
    Enums: {
      UserRole: 'ADMIN' | 'CUSTOMER'
      OrderStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
      PaymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
      PaymentMethod: 'GCASH' | 'CASH'
      VariantType: 'SIZE' | 'FLAVOR'
    }
    Functions: {
      exec_sql: {
        Args: { sql: string }
        Returns: undefined
      }
    }
  }
}
