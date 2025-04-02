'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useCategoryStore, type Category } from '@/lib/store/category-store'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

type FormValues = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & {
  imageFile: FileList | null
}

type CategoryFormProps = {
  category?: Category
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { toast } = useToast()
  const [imagePreview, setImagePreview] = useState<string | null>(category?.imageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get actions from the store
  const { addCategory, updateCategory } = useCategoryStore()
  
  const defaultValues = category
    ? {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        imageFile: null,
      }
    : {
        name: '',
        description: '',
        imageUrl: '',
        sortOrder: 0,
        imageFile: null,
      }
  
  const form = useForm<FormValues>({
    defaultValues,
  })
  
  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue('imageFile', e.target.files as FileList)
    }
  }
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      let imageUrl = values.imageUrl
      
      // Upload image if provided
      if (values.imageFile && values.imageFile.length > 0) {
        const file = values.imageFile[0]
        
        // Get the complete original filename with extension
        // Just do minimal sanitization to replace problematic characters with underscores
        const originalFileName = file.name.replace(/[\/\\:*?"<>|]/g, '_');
        const filePath = `categories/${originalFileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file)
          
        if (uploadError) {
          throw uploadError
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)
          
        imageUrl = urlData.publicUrl
      }
      
      // Prepare category data
      const categoryData = {
        name: values.name,
        description: values.description,
        imageUrl,
        sortOrder: values.sortOrder,
      }
      
      if (category) {
        // Update existing category
        await updateCategory(category.id, categoryData)
        
        toast({
          title: 'Success',
          description: 'Category updated successfully',
          variant: 'success',
        })
      } else {
        // Create new category
        await addCategory(categoryData)
        
        toast({
          title: 'Success',
          description: 'Category created successfully',
          variant: 'success',
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Category name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sortOrder"
              rules={{ required: 'Sort order is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter sort order" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              <Input 
                id="image" 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                onChange={handleImageChange}
              />
              <p className="text-xs text-slate-500">Upload a PNG, JPG, or WEBP image (max 2MB)</p>
              
              {imagePreview && (
                <div className="mt-4 relative aspect-video w-full max-w-sm overflow-hidden rounded-md">
                  <Image
                    src={imagePreview}
                    alt="Category preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 