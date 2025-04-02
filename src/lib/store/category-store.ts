import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { v4 as uuidv4 } from 'uuid'

type Category = Database['public']['Tables']['Category']['Row']

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
  selectedCategory: Category | null
  
  // Actions
  fetchCategories: () => Promise<Category[] | undefined>
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  selectCategory: (category: Category | null) => void
}

/**
 * Category Store
 * Centralized state management for categories using Zustand
 */
export const useCategoryStore = create<CategoryState>()(
  immer((set, get) => ({
    categories: [],
    loading: false,
    error: null,
    selectedCategory: null,

    // Fetch all categories
    fetchCategories: async () => {
      try {
        set(state => { state.loading = true; state.error = null; })
        
        const { data, error } = await supabase
          .from('Category')
          .select('*')
          .order('sortOrder', { ascending: true })
        
        if (error) throw error
        
        set(state => {
          state.categories = data || []
          state.loading = false
        })
        
        return data
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch categories'
          state.loading = false
        })
        return undefined
      }
    },

    // Add a new category
    addCategory: async (categoryData) => {
      try {
        set(state => { state.loading = true; state.error = null; })
        
        const newCategory = {
          id: uuidv4(),
          ...categoryData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        const { data, error } = await supabase
          .from('Category')
          .insert(newCategory)
          .select()
          .single()
        
        if (error) throw error
        
        set(state => {
          state.categories.push(data)
          state.loading = false
        })
        
        return data
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to add category'
          state.loading = false
        })
        throw error
      }
    },

    // Update an existing category
    updateCategory: async (id, categoryData) => {
      try {
        set(state => { state.loading = true; state.error = null; })
        
        const updatedData = {
          ...categoryData,
          updatedAt: new Date().toISOString(),
        }
        
        const { data, error } = await supabase
          .from('Category')
          .update(updatedData)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        
        set(state => {
          const index = state.categories.findIndex(cat => cat.id === id)
          if (index !== -1) {
            state.categories[index] = data
          }
          state.loading = false
        })
        
        return data
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to update category'
          state.loading = false
        })
        throw error
      }
    },

    // Delete a category
    deleteCategory: async (id) => {
      try {
        set(state => { state.loading = true; state.error = null; })
        
        // Find the category to get its image URL before deletion
        const categoryToDelete = get().categories.find(cat => cat.id === id)
        if (!categoryToDelete) {
          throw new Error('Category not found')
        }
        
        // Check if category has associated products
        const { data: productData, error: productError } = await supabase
          .from('Product')
          .select('id')
          .eq('categoryId', id)
        
        if (productError) throw productError
        
        // If there are associated products, don't delete
        if (productData && productData.length > 0) {
          const error = new Error(`This category has ${productData.length} product(s) attached to it. Remove the products first.`)
          throw error
        }
        
        // Delete image from storage if it exists
        if (categoryToDelete.imageUrl) {
          try {
            console.log('Attempting to delete image from URL:', categoryToDelete.imageUrl)
            
            // Extract the storage path from the URL
            // We need just the part after the bucket name: 'categories/filename.png'
            let storagePath = ''
            
            // Get the base storage URL from environment
            const baseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || 'https://heylcozpqbrpyjxkfzzz.supabase.co/storage/v1/object/public/images'
            
            // If the URL starts with the base storage URL, extract the path after it
            if (categoryToDelete.imageUrl.startsWith(baseStorageUrl)) {
              // Get everything after the base URL plus the trailing slash
              storagePath = categoryToDelete.imageUrl.substring(baseStorageUrl.length + 1)
              console.log('Extracted storage path:', storagePath)
            } else {
              // Fallback method using the URL structure
              const urlParts = categoryToDelete.imageUrl.split('/')
              
              // Find 'images' in the path (bucket name)
              const imagesIndex = urlParts.indexOf('images')
              if (imagesIndex !== -1 && imagesIndex + 1 < urlParts.length) {
                // Get all parts after 'images'
                storagePath = urlParts.slice(imagesIndex + 1).join('/')
                console.log('Fallback extracted storage path:', storagePath)
              } else {
                console.error('Could not find image path in URL:', categoryToDelete.imageUrl)
              }
            }
            
            if (storagePath) {
              // 1. Decode any URL-encoded characters (spaces, etc.)
              storagePath = decodeURIComponent(storagePath)
              
              // 2. Remove any leading slash which can cause deletion to fail silently
              if (storagePath.startsWith('/')) {
                storagePath = storagePath.substring(1)
              }
              
              console.log('Final cleaned storage path for deletion:', storagePath)
              
              // 3. Check if the file exists first using exists() method (available in supabase-js v2.45.2+)
              try {
                // Try using the exists() method if available in this version of Supabase
                const { data: fileExists } = await supabase.storage
                  .from('images')
                  .exists(storagePath)
                
                console.log('File exists check result:', fileExists)
                
                if (fileExists) {
                  // 4. File exists, proceed with deletion
                  const { error: storageError } = await supabase.storage
                    .from('images')
                    .remove([storagePath])
                    
                  if (storageError) {
                    console.error('Error deleting image:', storageError)
                  } else {
                    console.log('Image deletion command sent successfully')
                    
                    // 5. Verify deletion was successful by checking if the file still exists
                    const { data: stillExists } = await supabase.storage
                      .from('images')
                      .exists(storagePath)
                    
                    if (stillExists) {
                      console.error('File still exists after deletion attempt')
                    } else {
                      console.log('File deletion verified successful')
                    }
                  }
                } else {
                  console.log('File does not exist, no need to delete')
                }
              } catch (existsError) {
                // exists() method might not be available in older versions, fallback to list
                console.log('exists() method not available or failed, falling back to list:', existsError)
                
                // Fallback method: First get the folder path and filename
                const pathParts = storagePath.split('/')
                const fileName = pathParts.pop() || ''
                const folderPath = pathParts.join('/')
                
                // Check if file exists by listing the folder and searching for the file
                const { data: folderContents, error: listError } = await supabase.storage
                  .from('images')
                  .list(folderPath, {
                    search: fileName
                  })
                
                if (listError) {
                  console.error('Error listing folder contents:', listError)
                } else {
                  const fileExists = folderContents.some(file => file.name === fileName)
                  console.log('File exists check result (fallback method):', fileExists)
                  
                  if (fileExists) {
                    // File exists, proceed with deletion
                    const { error: storageError } = await supabase.storage
                      .from('images')
                      .remove([storagePath])
                      
                    if (storageError) {
                      console.error('Error deleting image:', storageError)
                    } else {
                      console.log('Image deletion command sent successfully')
                      
                      // Verify deletion
                      const { data: folderContentsAfter, error: listErrorAfter } = await supabase.storage
                        .from('images')
                        .list(folderPath, {
                          search: fileName
                        })
                      
                      if (listErrorAfter) {
                        console.error('Error verifying deletion:', listErrorAfter)
                      } else {
                        const fileStillExists = folderContentsAfter.some(file => file.name === fileName)
                        
                        if (fileStillExists) {
                          console.error('File still exists after deletion attempt')
                        } else {
                          console.log('File deletion verified successful')
                        }
                      }
                    }
                  } else {
                    console.log('File does not exist, no need to delete')
                  }
                }
              }
            }
          } catch (storageError) {
            console.error('Error processing image deletion:', storageError)
            // Continue with category deletion even if image processing fails
          }
        }
        
        // Delete category from database
        const { error } = await supabase
          .from('Category')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        set(state => {
          state.categories = state.categories.filter(cat => cat.id !== id)
          state.loading = false
        })
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to delete category'
          state.loading = false
        })
        throw error
      }
    },
    
    // Select a category for editing
    selectCategory: (category) => {
      set(state => { state.selectedCategory = category })
    }
  }))
)

export type { Category } 