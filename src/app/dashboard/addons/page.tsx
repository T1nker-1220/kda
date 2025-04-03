'use client'

import { AddonTable } from '@/components/dashboard/addons/addon-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { AddonForm } from '@/components/dashboard/addons/addon-form'

export default function AddonsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Addons Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Addon
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Manage global addons that can be applied to products. These addons are used as additional choices for customers.
      </p>
      
      <AddonTable />
      
      {/* Add Addon Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Addon</DialogTitle>
            <DialogDescription>
              Create a new global addon that can be applied to products.
            </DialogDescription>
          </DialogHeader>
          <AddonForm
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 