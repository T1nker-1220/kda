import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useProductStore, type ProductVariant } from '@/lib/store/product-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

type FormValues = {
  name: string
  price: number
  type: 'SIZE' | 'FLAVOR'
  stock: number
  isAvailable: boolean
  imageFile: FileList | null
}

type VariantFormProps = {
  productId: string
  variant?: ProductVariant
  onSuccess: () => void
  onCancel: () => void
}

export function VariantForm({
  productId,
  variant,
  onSuccess,
  onCancel,
}: VariantFormProps) {
  const { toast } = useToast()
  const [imagePreview, setImagePreview] = useState<string | null>(variant?.imageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get actions from the store
  const { addVariant, updateVariant } = useProductStore()

  const defaultValues = variant
    ? {
        name: variant.name,
        price: variant.price,
        type: variant.type,
        stock: variant.stock,
        isAvailable: variant.isAvailable,
        imageFile: null,
      }
    : {
        name: '',
        price: 0,
        type: 'SIZE' as const,
        stock: 0,
        isAvailable: true,
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

      let imageUrl = variant?.imageUrl || ''

      // Upload image if provided
      if (values.imageFile && values.imageFile.length > 0) {
        const file = values.imageFile[0]

        // Get the complete original filename with extension
        const originalFileName = file.name.replace(/[\/\\:*?"<>|]/g, '_')
        const filePath = `variants/${originalFileName}`

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

      // Prepare variant data
      const variantData = {
        name: values.name,
        price: values.price,
        type: values.type,
        stock: values.stock,
        isAvailable: values.isAvailable,
        imageUrl,
      }

      if (variant) {
        // Update existing variant
        await updateVariant(variant.id, variantData)

        toast({
          title: 'Success',
          description: 'Variant updated successfully',
          variant: 'success',
        })
      } else {
        // Create new variant
        await addVariant(productId, variantData)

        toast({
          title: 'Success',
          description: 'Variant added successfully',
          variant: 'success',
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save variant',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Variant name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter variant name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  rules={{ required: 'Variant type is required' }}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SIZE">Size</SelectItem>
                          <SelectItem value="FLAVOR">Flavor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  rules={{ 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be greater than or equal to 0' }
                  }}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Price</FormLabel>
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
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="stock"
                  rules={{ 
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock must be greater than or equal to 0' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter stock quantity" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Available</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormItem className="mt-4">
                  <FormLabel>Image</FormLabel>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-md mb-2">
                        <Image
                          src={imagePreview}
                          alt="Variant preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder size="lg" className="mb-2" variant="drink" text="" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </FormItem>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : variant ? 'Update Variant' : 'Add Variant'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 