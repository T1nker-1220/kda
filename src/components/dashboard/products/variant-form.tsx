import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProductStore, type ProductVariant } from '@/lib/store/product-store'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { supabase } from '@/lib/supabase/client'

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  originalName: z.string().optional().nullable(),
  description: z.string().optional(),
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, 'Price must be a positive number'),
  stock: z
    .number({ required_error: 'Stock quantity is required' })
    .int('Stock must be a whole number')
    .min(0, 'Stock must be a positive number'),
  type: z.enum(['SIZE', 'FLAVOR', 'OTHER']),
  variantGroup: z.string().min(1, 'Variant group is required'),
  displayOrder: z.number().int('Display order must be a whole number').min(0),
  isDefault: z.boolean(),
  isAvailable: z.boolean(),
  imageUrl: z.string().optional(),
  sizeValue: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface VariantFormProps {
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
  const { addVariant, updateVariant } = useProductStore()
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(variant?.imageUrl || null)

  // Set default values based on existing variant or create new defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: variant
      ? {
          name: variant.name,
          originalName: variant.originalName || null,
          description: '',
          price: variant.price,
          stock: variant.stock,
          type: variant.type as 'SIZE' | 'FLAVOR' | 'OTHER',
          variantGroup: variant.variantGroup || 'default',
          displayOrder: variant.displayOrder || 0,
          isDefault: variant.isDefault || false,
          isAvailable: variant.isAvailable,
          imageUrl: variant.imageUrl || '',
          sizeValue: variant.sizeValue || null,
        }
      : {
          name: '',
          originalName: null,
          description: '',
          price: 0,
          stock: 0,
          type: 'SIZE',
          variantGroup: 'default',
          displayOrder: 0,
          isDefault: false,
          isAvailable: true,
          imageUrl: '',
          sizeValue: null,
        },
  })

  const watchType = form.watch('type')

  // Determine if this is a size type variant to show the size value field
  const isSizeType = watchType === 'SIZE'

  // Predefined variant groups
  const variantGroups = [
    { value: 'default', label: 'Default' },
    { value: 'size_16oz', label: '16oz Size' },
    { value: 'size_22oz', label: '22oz Size' },
  ]

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      setUploading(true)
      let imageUrl = values.imageUrl

      // Upload image if there's a file with a preview that's not already uploaded
      if (imagePreview && !imagePreview.startsWith('http')) {
        const file = await fetch(imagePreview).then(r => r.blob())
        
        // Create a filename
        const filename = `variant-${Date.now()}.png`
        const filePath = `variants/${filename}`
        
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

      // Only include type: 'SIZE' or 'FLAVOR' for compatibility with existing code
      const type = values.type === 'OTHER' ? 'FLAVOR' : values.type

      const variantData = {
        name: values.name,
        originalName: values.originalName || null,
        price: values.price,
        stock: values.stock,
        type,
        variantGroup: values.variantGroup,
        displayOrder: values.displayOrder,
        isDefault: values.isDefault,
        isAvailable: values.isAvailable,
        imageUrl: imageUrl || null,
        sizeValue: values.sizeValue || null,
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
        // Add new variant
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
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image upload section */}
          <div>
            <FormLabel>Variant Image</FormLabel>
            <div className="h-48 mt-2 relative">
              {imagePreview ? (
                <div className="relative h-full w-full overflow-hidden rounded-md">
                  <Image
                    src={imagePreview}
                    alt="Variant preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <ImagePlaceholder size="lg" variant="drink" text="" />
              )}
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
              />
            </div>
            <FormDescription>
              Upload a clear image of this variant.
            </FormDescription>
          </div>

          {/* Basic details */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 16oz, Chocolate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Original name before standardization"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Use this for display while keeping standardized names internally.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SIZE">Size</SelectItem>
                      <SelectItem value="FLAVOR">Flavor</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Variant group and ordering */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="variantGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant Group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a variant group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {variantGroups.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Group similar variants together for organized display.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers appear first in the list.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional size value field */}
        {isSizeType && (
          <FormField
            control={form.control}
            name="sizeValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size Value</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 16oz, 500ml"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>
                  Specific measurement value for this size variant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Price and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Add details about this variant"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <FormLabel>Default Variant</FormLabel>
                  <FormDescription>
                    Set as the default selection for this product
                  </FormDescription>
                </div>
                <FormControl>
                  <Input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <FormLabel>Availability</FormLabel>
                  <FormDescription>
                    Make this variant available for purchase
                  </FormDescription>
                </div>
                <FormControl>
                  <Input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={uploading}
          >
            {variant ? 'Update Variant' : 'Add Variant'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 