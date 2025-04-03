'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useProductStore, type ProductWithVariants, type Product } from '@/lib/store/product-store'
import { useCategoryStore, type Category } from '@/lib/store/category-store'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

type FormValues = {
  name: string
  description: string
  imageUrl: string
  basePrice: number
  categoryId: string
  isAvailable: boolean
  allowsAddons: boolean
  imageFile: FileList | null
}

type ProductFormProps = {
  product?: ProductWithVariants
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast()
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get actions from the stores
  const { addProduct, updateProduct } = useProductStore()
  const { categories, fetchCategories } = useCategoryStore()

  // Fetch categories when the component mounts
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])
  
  const defaultValues = product
    ? {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        basePrice: product.basePrice,
        categoryId: product.categoryId,
        isAvailable: product.isAvailable,
        allowsAddons: product.allowsAddons,
        imageFile: null,
      }
    : {
        name: '',
        description: '',
        imageUrl: '',
        basePrice: 0,
        categoryId: '',
        isAvailable: true,
        allowsAddons: false,
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
        const originalFileName = file.name.replace(/[\/\\:*?"<>|]/g, '_')
        const filePath = `products/${originalFileName}`
        
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
      
      // Prepare product data
      const productData = {
        name: values.name,
        description: values.description,
        imageUrl,
        basePrice: values.basePrice,
        categoryId: values.categoryId,
        isAvailable: values.isAvailable,
        allowsAddons: values.allowsAddons,
      }
      
      if (product) {
        // Update existing product
        await updateProduct(product.id, productData)
        
        toast({
          title: 'Success',
          description: 'Product updated successfully',
          variant: 'success',
        })
      } else {
        // Create new product
        await addProduct(productData)
        
        toast({
          title: 'Success',
          description: 'Product created successfully',
          variant: 'success',
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Product name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
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
                    <Input placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="basePrice"
              rules={{ 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be greater than or equal to 0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter price" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-6">
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available</FormLabel>
                      <FormDescription>
                        This product can be ordered by customers
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowsAddons"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Addons</FormLabel>
                      <FormDescription>
                        This product can have addons (e.g., toppings)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
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
                    alt="Product preview"
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
                {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 