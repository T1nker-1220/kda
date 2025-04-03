'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useProductStore, 
  type ProductWithVariants
} from '@/lib/store/product-store'
import { useCategoryStore } from '@/lib/store/category-store'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { EllipsisVertical, Plus, Edit, Trash, ChevronUp, ChevronDown } from 'lucide-react'
import { ProductForm } from './product-form'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

export function ProductTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const { products, loading, error, fetchProducts, deleteProduct } = useProductStore()
  const { categories, fetchCategories } = useCategoryStore()
  
  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name)
    } else if (sortField === 'basePrice') {
      return sortOrder === 'asc' 
        ? a.basePrice - b.basePrice 
        : b.basePrice - a.basePrice
    } else if (sortField === 'category') {
      const categoryA = categories.find(c => c.id === a.categoryId)?.name || ''
      const categoryB = categories.find(c => c.id === b.categoryId)?.name || ''
      return sortOrder === 'asc' 
        ? categoryA.localeCompare(categoryB) 
        : categoryB.localeCompare(categoryA)
    }
    return 0
  })
  
  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }
  
  // Handle view product details
  const handleViewDetails = (product: ProductWithVariants) => {
    router.push(`/dashboard/products/${product.id}`)
  }
  
  // Handle edit product
  const handleEditProduct = (product: ProductWithVariants) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }
  
  // Handle delete product
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    
    try {
      await deleteProduct(selectedProduct.id)
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        variant: 'success',
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }
  
  if (loading) {
    return <div className="py-10 text-center">Loading products...</div>
  }
  
  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Error loading products: {error}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-md">
          <p className="text-muted-foreground">No products found. Create your first product.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('basePrice')}
                >
                  <div className="flex items-center">
                    Base Price
                    {sortField === 'basePrice' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow 
                  key={product.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewDetails(product)}
                >
                  <TableCell className="w-[80px] p-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImagePlaceholder size="md" variant="drink" text="" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                  <TableCell>
                    <Badge variant={product.isAvailable ? 'success' : 'destructive'}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.variants?.length || 0}</TableCell>
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <EllipsisVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedProduct(product)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product with all details.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProduct?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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