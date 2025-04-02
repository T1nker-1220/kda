'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryTable } from '@/components/dashboard/categories/category-table'
import { CategoryForm } from '@/components/dashboard/categories/category-form'
import { useCategoryStore, type Category } from '@/lib/store/category-store'
import { PlusCircle } from 'lucide-react'

export default function CategoriesPage() {
  const { addCategory, updateCategory } = useCategoryStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)

  const handleAddClick = () => {
    setEditingCategory(undefined)
    setIsFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (formData: Omit<Category, 'id'> & { id?: string }) => {
    try {
      if (formData.id) {
        // Update existing category
        await updateCategory(formData.id, formData)
      } else {
        // Add new category
        await addCategory(formData)
      }
      setIsFormOpen(false)
      setEditingCategory(undefined)
    } catch (error) {
      // Error is handled by the toast in the store
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingCategory(undefined)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your menu categories
          </p>
        </div>
        
        {!isFormOpen && (
          <Button onClick={handleAddClick}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <CategoryForm
          category={editingCategory}
          onSuccess={handleFormCancel}
          onCancel={handleFormCancel}
        />
      ) : (
        <CategoryTable onEdit={handleEditCategory} />
      )}
    </div>
  )
} 