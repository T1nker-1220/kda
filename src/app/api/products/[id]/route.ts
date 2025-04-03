import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to check if user is admin
async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single()
    
  return data?.role === 'ADMIN'
}

/**
 * GET /api/products/[id]
 * Retrieves a specific product by ID with its variants
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    // Get product with its variants
    const { data, error } = await supabase
      .from('Product')
      .select(`
        *,
        Category(id, name),
        ProductVariant(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      // Not found should return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch product', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/[id]
 * Updates a specific product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    // Check admin authorization
    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Validate request
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      )
    }
    
    // If categoryId is being updated, verify the category exists
    if (body.categoryId) {
      const { data: categoryExists, error: categoryError } = await supabase
        .from('Category')
        .select('id')
        .eq('id', body.categoryId)
        .single()
        
      if (categoryError) {
        return NextResponse.json(
          { error: 'Invalid category ID', details: categoryError },
          { status: 400 }
        )
      }
    }
    
    // Prepare update data
    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.description && { description: body.description }),
      ...(body.imageUrl && { imageUrl: body.imageUrl }),
      ...(body.basePrice !== undefined && { basePrice: parseFloat(body.basePrice) }),
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      ...(body.allowsAddons !== undefined && { allowsAddons: body.allowsAddons }),
      updatedAt: new Date().toISOString()
    }
    
    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('Product')
      .select('id')
      .eq('id', id)
      .single()
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to check product existence', details: checkError },
        { status: 500 }
      )
    }
    
    // Update the product
    const { data, error } = await supabase
      .from('Product')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update product', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]
 * Deletes a specific product and its variants
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    // Check admin authorization
    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
    
    // Check if product has associated order items
    const { data: relatedOrderItems, error: orderItemError } = await supabase
      .from('OrderItem')
      .select('id')
      .eq('productId', id)
      
    if (orderItemError) {
      return NextResponse.json(
        { error: 'Failed to check related order items', details: orderItemError },
        { status: 500 }
      )
    }
    
    // Prevent deletion if order items are associated
    if (relatedOrderItems && relatedOrderItems.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product with associated orders',
          orderItemCount: relatedOrderItems.length
        },
        { status: 409 }
      )
    }
    
    // Begin transaction to delete product and its variants
    // First delete all variants
    const { error: variantError } = await supabase
      .from('ProductVariant')
      .delete()
      .eq('productId', id)
      
    if (variantError) {
      return NextResponse.json(
        { error: 'Failed to delete product variants', details: variantError },
        { status: 500 }
      )
    }
    
    // Then delete the product
    const { data, error } = await supabase
      .from('Product')
      .delete()
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete product', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Product and its variants deleted successfully', data: data[0] }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 