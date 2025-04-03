'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAddonStore } from '@/lib/store/addon-store'
import { GlobalAddon } from '@/lib/db/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

type FormValues = {
  name: string
  price: number
  isAvailable: boolean
}

type AddonFormProps = {
  addon?: GlobalAddon
  onSuccess: () => void
  onCancel: () => void
}

export function AddonForm({ addon, onSuccess, onCancel }: AddonFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get actions from the store
  const { addAddon, updateAddon } = useAddonStore()
  
  const defaultValues = addon
    ? {
        name: addon.name,
        price: addon.price,
        isAvailable: addon.isAvailable,
      }
    : {
        name: '',
        price: 0,
        isAvailable: true,
      }
  
  const form = useForm<FormValues>({
    defaultValues,
  })
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      if (addon) {
        // Update existing addon
        await updateAddon(addon.id, values)
        
        toast({
          title: 'Success',
          description: 'Addon updated successfully',
          variant: 'success',
        })
      } else {
        // Create new addon
        await addAddon(values)
        
        toast({
          title: 'Success',
          description: 'Addon created successfully',
          variant: 'success',
        })
      }
      
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save addon',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Addon name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter addon name" {...field} />
              </FormControl>
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
            <FormItem>
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
                  This addon can be selected by customers
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : addon ? 'Update Addon' : 'Create Addon'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 