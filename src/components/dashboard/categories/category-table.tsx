'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useCategoryStore, type Category } from '@/lib/store/category-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CategoryTableProps {
  onEdit: (category: Category) => void;
}

export function CategoryTable({ onEdit }: CategoryTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Get state and actions from the store
  const { 
    categories, 
    loading, 
    error: storeError, 
    fetchCategories,
    deleteCategory
  } = useCategoryStore()
  
  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setAuthError('No active session found - you may need to log in')
          
          // Redirect to login if no session
          setTimeout(() => {
            router.push('/login?redirectTo=/dashboard/categories')
          }, 3000)
        }
      } catch (e) {
        setAuthError(`Authentication error: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    
    checkAuth()
  }, [router])
  
  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch (err) {
        // Error handling is done in the store
      }
    };
    
    loadCategories();
  }, [fetchCategories])
  
  // Handle edit category
  const handleEdit = (category: Category) => {
    onEdit(category)
  }
  
  // Handle delete category
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(id)
        
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
          variant: 'success',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete category',
          variant: 'destructive',
        })
      }
    }
  }
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading categories...</div>
  }
  
  if (storeError) {
    return (
      <div className="p-8 space-y-4">
        <div className="text-red-500">Error loading categories: {storeError}</div>
        {authError && (
          <div className="text-amber-500">
            <p>Authentication issue detected: {authError}</p>
            <p>This might be preventing you from accessing the data.</p>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {authError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          <p>Authentication notice: {authError}</p>
        </div>
      )}
      
      {categories.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          No categories found. Create a category to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {category.description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Sort Order: {category.sortOrder}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="Edit category"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="Delete category"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 