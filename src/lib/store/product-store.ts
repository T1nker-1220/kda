import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { v4 as uuidv4 } from 'uuid'
// Define Category type using the Database type

// Type definitions
export type Product = Database['public']['Tables']['Product']['Row']
export type ProductVariant = Database['public']['Tables']['ProductVariant']['Row']
export type Category = Database['public']['Tables']['Category']['Row']

// Extended type with variants and category information
export type ProductWithVariants = Product & {
  variants: ProductVariant[]
  category: Category | null
}

// Product store state interface
export interface ProductState {
  // State
  products: ProductWithVariants[]
  selectedProduct: ProductWithVariants | null
  isLoading: boolean
  loading: boolean  // Alias for isLoading
  error: string | null
  
  // Actions
  fetchProducts: (filters?: { categoryId?: string; isAvailable?: boolean }) => Promise<void>
  getProduct: (id: string) => Promise<ProductWithVariants | null>
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, variants?: Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[]) => Promise<ProductWithVariants | null>
  updateProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<ProductWithVariants | null>
  deleteProduct: (id: string) => Promise<boolean>
  selectProduct: (product: ProductWithVariants | null) => void
  
  // Variant actions
  addVariant: (productId: string, variant: Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>) => Promise<ProductVariant | null>
  updateVariant: (variantId: string, variantData: Partial<Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>>) => Promise<ProductVariant | null>
  deleteVariant: (variantId: string) => Promise<boolean>
  
  // Utility actions
  clearError: () => void
}

/**
 * Product Store using Zustand
 * Manages state and operations for products and their variants
 */
export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  isLoading: false,
  loading: false,  // Alias for isLoading
  error: null,
  
  /**
   * Fetches all products with their variants and category information
   */
  fetchProducts: async (filters) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      // First, fetch all products
      let query = supabase.from('Product').select('*')
      
      // Apply filters if provided
      if (filters?.categoryId) {
        query = query.eq('categoryId', filters.categoryId)
      }
      
      if (filters?.isAvailable !== undefined) {
        query = query.eq('isAvailable', filters.isAvailable)
      }
      
      const { data: products, error: productsError } = await query
      
      if (productsError) {
        throw productsError
      }
      
      // If no products found, set empty array and return
      if (!products || products.length === 0) {
        set({ products: [], isLoading: false, loading: false })
        return
      }
      
      // Fetch all variants for these products
      const productIds = products.map(p => p.id)
      const { data: variants, error: variantsError } = await supabase
        .from('ProductVariant')
        .select('*')
        .in('productId', productIds)
      
      if (variantsError) {
        throw variantsError
      }
      
      // Fetch all categories for these products
      const categoryIds = Array.from(new Set(products.map(p => p.categoryId)))
      const { data: categories, error: categoriesError } = await supabase
        .from('Category')
        .select('*')
        .in('id', categoryIds)
      
      if (categoriesError) {
        throw categoriesError
      }
      
      // Combine the data
      const productsWithVariants: ProductWithVariants[] = products.map(product => {
        const productVariants = variants?.filter(v => v.productId === product.id) || []
        const category = categories?.find(c => c.id === product.categoryId) || null
        
        return {
          ...product,
          variants: productVariants,
          category
        }
      })
      
      set({ products: productsWithVariants, isLoading: false, loading: false })
    } catch (error) {
      console.error('Error fetching products:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products', 
        isLoading: false,
        loading: false
      })
    }
  },
  
  /**
   * Gets a single product with its variants and category information
   */
  getProduct: async (id) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      // Fetch the product
      const { data: product, error: productError } = await supabase
        .from('Product')
        .select('*')
        .eq('id', id)
        .single()
      
      if (productError) {
        throw productError
      }
      
      if (!product) {
        throw new Error('Product not found')
      }
      
      // Fetch variants
      const { data: variants, error: variantsError } = await supabase
        .from('ProductVariant')
        .select('*')
        .eq('productId', id)
      
      if (variantsError) {
        throw variantsError
      }
      
      // Fetch category
      const { data: category, error: categoryError } = await supabase
        .from('Category')
        .select('*')
        .eq('id', product.categoryId)
        .single()
      
      if (categoryError && categoryError.code !== 'PGRST116') {
        throw categoryError
      }
      
      const productWithVariants: ProductWithVariants = {
        ...product,
        variants: variants || [],
        category: category || null
      }
      
      set({ 
        selectedProduct: productWithVariants,
        isLoading: false,
        loading: false
      })
      
      return productWithVariants
    } catch (error) {
      console.error('Error fetching product:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch product', 
        isLoading: false,
        loading: false
      })
      return null
    }
  },
  
  /**
   * Adds a new product with optional variants
   */
  addProduct: async (productData, variants = []) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      const productId = uuidv4()
      const now = new Date().toISOString()
      
      // Create the product
      const newProduct: Product = {
        id: productId,
        name: productData.name,
        imageUrl: productData.imageUrl,
        basePrice: productData.basePrice,
        categoryId: productData.categoryId,
        description: productData.description,
        isAvailable: productData.isAvailable ?? true,
        allowsAddons: productData.allowsAddons ?? false,
        createdAt: now,
        updatedAt: now
      }
      
      const { data: createdProduct, error: productError } = await supabase
        .from('Product')
        .insert(newProduct)
        .select()
      
      if (productError) {
        throw productError
      }
      
      let createdVariants: ProductVariant[] = []
      
      // Create variants if provided
      if (variants.length > 0) {
        const variantsToInsert = variants.map(variant => ({
          id: uuidv4(),
          productId,
          name: variant.name,
          type: variant.type,
          price: variant.price,
          stock: variant.stock,
          imageUrl: variant.imageUrl || null,
          isAvailable: variant.isAvailable ?? true,
          createdAt: now,
          updatedAt: now
        }))
        
        const { data, error: variantsError } = await supabase
          .from('ProductVariant')
          .insert(variantsToInsert)
          .select()
        
        if (variantsError) {
          throw variantsError
        }
        
        createdVariants = data || []
      }
      
      // Fetch category information
      const { data: category, error: categoryError } = await supabase
        .from('Category')
        .select('*')
        .eq('id', productData.categoryId)
        .single()
      
      if (categoryError && categoryError.code !== 'PGRST116') {
        throw categoryError
      }
      
      const productWithVariants: ProductWithVariants = {
        ...createdProduct[0],
        variants: createdVariants,
        category: category || null
      }
      
      // Update state
      set((state) => ({
        products: [...state.products, productWithVariants],
        selectedProduct: productWithVariants,
        isLoading: false,
        loading: false
      }))
      
      return productWithVariants
    } catch (error) {
      console.error('Error adding product:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add product', 
        isLoading: false,
        loading: false
      })
      return null
    }
  },
  
  /**
   * Updates an existing product
   */
  updateProduct: async (id, productData) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      const updateData = {
        ...productData,
        updatedAt: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('Product')
        .update(updateData)
        .eq('id', id)
        .select()
      
      if (error) {
        throw error
      }
      
      const updatedProduct = data[0]
      
      // Get current state to update
      const state = get()
      const currentProduct = state.products.find(p => p.id === id)
      
      if (!currentProduct) {
        throw new Error('Product not found in state')
      }
      
      // If category changed, fetch the new category
      let category = currentProduct.category
      if (productData.categoryId && productData.categoryId !== currentProduct.category?.id) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('Category')
          .select('*')
          .eq('id', productData.categoryId)
          .single()
        
        if (categoryError && categoryError.code !== 'PGRST116') {
          throw categoryError
        }
        
        category = newCategory || null
      }
      
      const productWithVariants: ProductWithVariants = {
        ...updatedProduct,
        variants: currentProduct.variants,
        category
      }
      
      // Update state
      set((state) => ({
        products: state.products.map((p: ProductWithVariants) => 
          p.id === id ? productWithVariants : p
        ),
        selectedProduct: state.selectedProduct?.id === id ? productWithVariants : state.selectedProduct,
        isLoading: false,
        loading: false
      }))
      
      return productWithVariants
    } catch (error) {
      console.error('Error updating product:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update product', 
        isLoading: false,
        loading: false
      })
      return null
    }
  },
  
  /**
   * Deletes a product and all its variants
   */
  deleteProduct: async (id) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      // First check if the product has any associated orders
      // This would require checking OrderItem table for items with this product
      // Implementation depends on how orders are structured
      
      // Delete all variants first
      const { error: variantsError } = await supabase
        .from('ProductVariant')
        .delete()
        .eq('productId', id)
      
      if (variantsError) {
        throw variantsError
      }
      
      // Delete the product
      const { error: productError } = await supabase
        .from('Product')
        .delete()
        .eq('id', id)
      
      if (productError) {
        throw productError
      }
      
      // Remove any images from storage
      // This would require storage helpers to clean up images
      // Implementation depends on how images are stored
      
      // Update state
      set((state) => ({
        products: state.products.filter((p: ProductWithVariants) => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
        loading: false
      }))
      
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete product', 
        isLoading: false,
        loading: false
      })
      return false
    }
  },
  
  /**
   * Adds a new variant to a product
   */
  addVariant: async (productId, variant) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      const variantId = uuidv4()
      const now = new Date().toISOString()
      
      // Create the variant with all fields
      const newVariant = {
        id: variantId,
        productId,
        name: variant.name,
        type: variant.type,
        price: variant.price,
        stock: variant.stock,
        imageUrl: variant.imageUrl || null,
        isAvailable: variant.isAvailable ?? true,
        variantGroup: variant.variantGroup || 'default',
        displayOrder: variant.displayOrder || 0,
        isDefault: variant.isDefault || false,
        originalName: variant.originalName || null,
        sizeValue: variant.sizeValue || null,
        createdAt: now,
        updatedAt: now
      }
      
      const { data: createdVariant, error: variantError } = await supabase
        .from('ProductVariant')
        .insert(newVariant)
        .select()
      
      if (variantError) {
        throw variantError
      }
      
      // Update the products state by adding the new variant
      const state = get()
      const updatedProducts = state.products.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            variants: [...product.variants, newVariant]
          }
        }
        return product
      })
      
      // Update selectedProduct if it's the current product
      let updatedSelectedProduct = state.selectedProduct
      if (state.selectedProduct?.id === productId) {
        updatedSelectedProduct = {
          ...state.selectedProduct,
          variants: [...state.selectedProduct.variants, newVariant]
        }
      }
      
      set({ 
        products: updatedProducts, 
        selectedProduct: updatedSelectedProduct,
        isLoading: false,
        loading: false
      })
      
      return createdVariant?.[0] || null
    } catch (error) {
      console.error('Error adding variant:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add variant', 
        isLoading: false,
        loading: false
      })
      return null
    }
  },
  
  /**
   * Updates an existing variant
   */
  updateVariant: async (variantId, variantData) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      
      const now = new Date().toISOString()
      
      // Update the variant
      const updatedData = {
        ...variantData,
        updatedAt: now
      }
      
      const { data: updatedVariant, error: variantError } = await supabase
        .from('ProductVariant')
        .update(updatedData)
        .eq('id', variantId)
        .select()
      
      if (variantError) {
        throw variantError
      }
      
      if (!updatedVariant || updatedVariant.length === 0) {
        throw new Error('Variant not found')
      }
      
      // Update the products state by updating the variant
      const state = get()
      const updatedProducts = state.products.map(product => {
        const variantIndex = product.variants.findIndex(v => v.id === variantId)
        if (variantIndex !== -1) {
          const updatedVariants = [...product.variants]
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            ...updatedData
          }
          return {
            ...product,
            variants: updatedVariants
          }
        }
        return product
      })
      
      // Update selectedProduct if it contains this variant
      let updatedSelectedProduct = state.selectedProduct
      if (state.selectedProduct) {
        const variantIndex = state.selectedProduct.variants.findIndex(v => v.id === variantId)
        if (variantIndex !== -1) {
          const updatedVariants = [...state.selectedProduct.variants]
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            ...updatedData
          }
          updatedSelectedProduct = {
            ...state.selectedProduct,
            variants: updatedVariants
          }
        }
      }
      
      set({ 
        products: updatedProducts, 
        selectedProduct: updatedSelectedProduct,
        isLoading: false,
        loading: false
      })
      
      return updatedVariant[0]
    } catch (error) {
      console.error('Error updating variant:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update variant', 
        isLoading: false,
        loading: false
      })
      return null
    }
  },
  
  /**
   * Deletes a product variant
   */
  deleteVariant: async (variantId) => {
    const state = get()
    
    try {
      set({ isLoading: true, loading: true, error: null })
      
      // First get the variant to know which product it belongs to
      const { data: variant, error: getError } = await supabase
        .from('ProductVariant')
        .select('*')
        .eq('id', variantId)
        .single()
      
      if (getError) {
        throw getError
      }
      
      if (!variant) {
        throw new Error('Variant not found')
      }
      
      const productId = variant.productId
      
      // Delete the variant
      const { error: deleteError } = await supabase
        .from('ProductVariant')
        .delete()
        .eq('id', variantId)
      
      if (deleteError) {
        throw deleteError
      }
      
      // Find the product this variant belongs to
      const product = state.selectedProduct?.id === productId 
        ? state.selectedProduct 
        : state.products.find((p: ProductWithVariants) => p.id === productId)
      
      if (!product) {
        throw new Error('Product not found for this variant')
      }
      
      // Remove the variant from the product
      const updatedProduct = {
        ...product,
        variants: product.variants.filter((v: ProductVariant) => v.id !== variantId)
      }
      
      // Update state
      set((state) => ({
        products: state.products.map((p: ProductWithVariants) => 
          p.id === productId ? updatedProduct : p
        ),
        selectedProduct: state.selectedProduct?.id === productId ? updatedProduct : state.selectedProduct,
        isLoading: false,
        loading: false
      }))
      
      return true
    } catch (error) {
      console.error('Error deleting variant:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete variant', 
        isLoading: false,
        loading: false
      })
      return false
    }
  },
  
  /**
   * Sets the selected product
   */
  selectProduct: (product) => {
    set({ selectedProduct: product })
  },
  
  /**
   * Clears any error in the state
   */
  clearError: () => {
    set({ error: null })
  }
})) 