import { useState, useMemo } from 'react'
import { useProductStore, type ProductVariant } from '@/lib/store/product-store'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { EllipsisVertical, Plus, Edit, Trash } from 'lucide-react'
import { VariantForm } from './variant-form'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

interface VariantTableProps {
  productId: string
  variants: ProductVariant[]
}

export function VariantTable({ productId, variants }: VariantTableProps) {
  const { toast } = useToast()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const { deleteVariant } = useProductStore()

  // Group variants by variantGroup
  const variantGroups = useMemo(() => {
    // All variants group
    const groups: Record<string, ProductVariant[]> = {
      all: [...variants].sort((a, b) => a.displayOrder - b.displayOrder),
    };

    // Get unique variant groups
    const uniqueGroups = Array.from(
      new Set(variants.map(variant => variant.variantGroup))
    );

    // Create groups and sort by displayOrder
    uniqueGroups.forEach(group => {
      groups[group] = variants
        .filter(variant => variant.variantGroup === group)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    });

    return groups;
  }, [variants]);

  // Create tab display names
  const getTabName = (groupKey: string) => {
    if (groupKey === 'all') return 'All Variants';
    if (groupKey === 'size_16oz') return '16oz Size';
    if (groupKey === 'size_22oz') return '22oz Size';
    return groupKey.charAt(0).toUpperCase() + groupKey.slice(1).replace('_', ' ');
  };

  const getVariantTypeBadge = (type: string) => {
    switch (type) {
      case 'SIZE':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Size</Badge>
      case 'FLAVOR':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Flavor</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  // Display the variant name, using originalName if available
  const getDisplayName = (variant: ProductVariant) => {
    return variant.originalName || variant.name;
  };

  // Handle edit variant
  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setIsEditDialogOpen(true)
  }

  // Handle delete variant
  const handleDeleteConfirm = async () => {
    if (!selectedVariant) return

    try {
      await deleteVariant(selectedVariant.id)
      toast({
        title: 'Success',
        description: 'Variant deleted successfully',
        variant: 'success',
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete variant',
        variant: 'destructive',
      })
    }
  }

  // Render variant table for a specific group
  const renderVariantTable = (variantsToShow: ProductVariant[]) => {
    if (variantsToShow.length === 0) {
      return (
        <div className="text-center py-8 bg-muted/30 rounded-md">
          <p className="text-muted-foreground">No variants found in this group.</p>
        </div>
      );
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variantsToShow.map((variant) => (
              <TableRow key={variant.id} className={variant.isDefault ? "bg-muted/20" : ""}>
                <TableCell className="p-2">
                  <div className="relative h-14 w-14 overflow-hidden rounded-md">
                    {variant.imageUrl ? (
                      <Image
                        src={variant.imageUrl}
                        alt={variant.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder size="sm" variant="drink" text="" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{getDisplayName(variant)}</span>
                    {variant.isDefault && <Badge className="mt-1 w-fit" variant="outline">Default</Badge>}
                    {variant.sizeValue && <span className="text-xs text-muted-foreground mt-1">{variant.sizeValue}</span>}
                  </div>
                </TableCell>
                <TableCell>{getVariantTypeBadge(variant.type)}</TableCell>
                <TableCell>{formatCurrency(variant.price)}</TableCell>
                <TableCell>{variant.stock}</TableCell>
                <TableCell>
                  <Badge variant={variant.isAvailable ? 'success' : 'destructive'}>
                    {variant.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditVariant(variant)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedVariant(variant)
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
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variants</h3>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-md">
          <p className="text-muted-foreground">No variants found. Add your first variant.</p>
        </div>
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">All Variants</TabsTrigger>
            {Object.keys(variantGroups)
              .filter(group => group !== 'all')
              .sort()
              .map(group => (
                <TabsTrigger key={group} value={group}>
                  {getTabName(group)}
                </TabsTrigger>
              ))}
          </TabsList>

          <TabsContent value="all">
            {renderVariantTable(variantGroups.all)}
          </TabsContent>
          
          {Object.keys(variantGroups)
            .filter(group => group !== 'all')
            .sort()
            .map(group => (
              <TabsContent key={group} value={group}>
                {renderVariantTable(variantGroups[group])}
              </TabsContent>
            ))}
        </Tabs>
      )}

      {/* Add Variant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Variant</DialogTitle>
            <DialogDescription>
              Create a new variant for this product.
            </DialogDescription>
          </DialogHeader>
          <VariantForm
            productId={productId}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Variant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
            <DialogDescription>
              Update variant details.
            </DialogDescription>
          </DialogHeader>
          {selectedVariant && (
            <VariantForm
              productId={productId}
              variant={selectedVariant}
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
            <DialogTitle>Delete Variant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this variant? This action cannot be undone.
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