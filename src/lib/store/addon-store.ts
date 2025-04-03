import { create } from 'zustand'
import { GlobalAddon } from '@/lib/db/types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type AddonState = {
  // State
  addons: GlobalAddon[]
  selectedAddon: GlobalAddon | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAddons: (filters?: { isAvailable?: boolean }) => Promise<void>
  getAddon: (id: string) => Promise<GlobalAddon | null>
  addAddon: (addon: Omit<GlobalAddon, 'id' | 'createdAt' | 'updatedAt'>) => Promise<GlobalAddon | null>
  updateAddon: (id: string, addonData: Partial<Omit<GlobalAddon, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<GlobalAddon | null>
  deleteAddon: (id: string) => Promise<boolean>
  selectAddon: (addon: GlobalAddon | null) => void
  clearError: () => void
}

/**
 * Global Addon Store using Zustand
 * Manages state and operations for global addons
 */
export const useAddonStore = create<AddonState>((set, get) => ({
  // Initial state
  addons: [],
  selectedAddon: null,
  isLoading: false,
  error: null,
  
  /**
   * Fetches all global addons with optional filtering
   */
  fetchAddons: async (filters) => {
    const supabase = createClientComponentClient()
    
    try {
      set({ isLoading: true, error: null })
      
      let query = supabase.from('GlobalAddon').select('*')
      
      // Apply filters if provided
      if (filters?.isAvailable !== undefined) {
        query = query.eq('isAvailable', filters.isAvailable)
      }
      
      // Order by name by default
      query = query.order('name')
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      set({ addons: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching addons:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch addons', 
        isLoading: false 
      })
    }
  },
  
  /**
   * Gets a single addon by ID
   */
  getAddon: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      set({ isLoading: true, error: null })
      
      const { data, error } = await supabase
        .from('GlobalAddon')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        throw error
      }
      
      set({ selectedAddon: data, isLoading: false })
      return data
    } catch (error) {
      console.error('Error fetching addon:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch addon', 
        isLoading: false 
      })
      return null
    }
  },
  
  /**
   * Adds a new global addon
   */
  addAddon: async (addonData) => {
    const supabase = createClientComponentClient()
    
    try {
      set({ isLoading: true, error: null })
      
      const now = new Date().toISOString()
      const newAddon = {
        ...addonData,
        isAvailable: addonData.isAvailable ?? true,
        createdAt: now,
        updatedAt: now
      }
      
      const { data, error } = await supabase
        .from('GlobalAddon')
        .insert(newAddon)
        .select()
      
      if (error) {
        throw error
      }
      
      const createdAddon = data[0]
      
      // Update state with new addon
      set((state) => ({
        addons: [...state.addons, createdAddon],
        selectedAddon: createdAddon,
        isLoading: false
      }))
      
      return createdAddon
    } catch (error) {
      console.error('Error adding addon:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add addon', 
        isLoading: false 
      })
      return null
    }
  },
  
  /**
   * Updates an existing global addon
   */
  updateAddon: async (id, addonData) => {
    const supabase = createClientComponentClient()
    
    try {
      set({ isLoading: true, error: null })
      
      const updateData = {
        ...addonData,
        updatedAt: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('GlobalAddon')
        .update(updateData)
        .eq('id', id)
        .select()
      
      if (error) {
        throw error
      }
      
      const updatedAddon = data[0]
      
      // Update state with modified addon
      set((state) => ({
        addons: state.addons.map(addon => 
          addon.id === id ? updatedAddon : addon
        ),
        selectedAddon: state.selectedAddon?.id === id ? updatedAddon : state.selectedAddon,
        isLoading: false
      }))
      
      return updatedAddon
    } catch (error) {
      console.error('Error updating addon:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update addon', 
        isLoading: false 
      })
      return null
    }
  },
  
  /**
   * Deletes a global addon
   */
  deleteAddon: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      set({ isLoading: true, error: null })
      
      // Check if addon is associated with any order items before deletion
      const { data: relatedItems, error: checkError } = await supabase
        .from('OrderItemAddon')
        .select('id')
        .eq('addonId', id)
      
      if (checkError) {
        throw checkError
      }
      
      // Prevent deletion if addon is used in orders
      if (relatedItems && relatedItems.length > 0) {
        set({ 
          error: 'Cannot delete addon that is used in orders', 
          isLoading: false 
        })
        return false
      }
      
      // Delete the addon
      const { error: deleteError } = await supabase
        .from('GlobalAddon')
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      // Update state after successful deletion
      set((state) => ({
        addons: state.addons.filter(addon => addon.id !== id),
        selectedAddon: state.selectedAddon?.id === id ? null : state.selectedAddon,
        isLoading: false
      }))
      
      return true
    } catch (error) {
      console.error('Error deleting addon:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete addon', 
        isLoading: false 
      })
      return false
    }
  },
  
  /**
   * Sets the selected addon
   */
  selectAddon: (addon) => {
    set({ selectedAddon: addon })
  },
  
  /**
   * Clears any error in the state
   */
  clearError: () => {
    set({ error: null })
  }
})) 