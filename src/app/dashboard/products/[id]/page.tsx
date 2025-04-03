'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProductStore, type ProductWithVariants } from '@/lib/store/product-store'
import { useCategoryStore } from '@/lib/store/category-store'
import { ProductForm } from '@/components/dashboard/products/product-form'
import { VariantTable } from '@/components/dashboard/products/variant-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const { getProduct, selectedProduct, deleteProduct } = useProductStore()
  const { categories, fetchCategories } = useCategoryStore()
  
  useEffect(() => {
    fetchCategories()
    getProduct(params.id)
  }, [params.id, getProduct, fetchCategories])
  
  const handleBack = () => {
    router.push('/dashboard/products')
  }
  
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    
    try {
      await deleteProduct(selectedProduct.id)
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        variant: 'success',
      })
      router.push('/dashboard/products')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }
  
  if (!selectedProduct) {
    return (
      <div className="py-10 text-center">
        <p>Loading product details...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{selectedProduct.name}</h1>
          <Badge variant={selectedProduct.isAvailable ? 'success' : 'destructive'}>
            {selectedProduct.isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1">{selectedProduct.description}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Category</dt>
                <dd className="mt-1">{getCategoryName(selectedProduct.categoryId)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Base Price</dt>
                <dd className="mt-1">{formatCurrency(selectedProduct.basePrice)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Allows Addons</dt>
                <dd className="mt-1">{selectedProduct.allowsAddons ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative h-48 w-48 overflow-hidden rounded-md">
              {selectedProduct.imageUrl ? (
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder size="lg" className="h-48 w-48" variant="drink" text="" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <VariantTable 
            productId={selectedProduct.id} 
            variants={selectedProduct.variants || []} 
          />
        </CardContent>
      </Card>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              getProduct(params.id)
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone and will delete all variants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 