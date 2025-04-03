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
 * GET /api/products/variants/[id]
 * Retrieves a specific product variant by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    const { data, error } = await supabase
      .from('ProductVariant')
      .select(`
        *,
        Product(id, name, imageUrl, basePrice, categoryId)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      // Not found should return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product variant not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch product variant', details: error },
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
 * PUT /api/products/variants/[id]
 * Updates a specific product variant
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
    
    // Validate variant type if provided
    if (body.type && !['SIZE', 'FLAVOR'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid variant type. Must be either SIZE or FLAVOR' },
        { status: 400 }
      )
    }
    
    // Prepare update data
    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.type && { type: body.type }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      updatedAt: new Date().toISOString()
    }
    
    // Check if variant exists
    const { data: existingVariant, error: checkError } = await supabase
      .from('ProductVariant')
      .select('id')
      .eq('id', id)
      .single()
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product variant not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to check variant existence', details: checkError },
        { status: 500 }
      )
    }
    
    // Update the variant
    const { data, error } = await supabase
      .from('ProductVariant')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update product variant', details: error },
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
 * DELETE /api/products/variants/[id]
 * Deletes a specific product variant
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
    
    // Check if variant has associated order items
    const { data: relatedOrderItems, error: orderItemError } = await supabase
      .from('OrderItem')
      .select('id')
      .eq('productVariantId', id)
      
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
          error: 'Cannot delete variant with associated orders',
          orderItemCount: relatedOrderItems.length
        },
        { status: 409 }
      )
    }
    
    // Delete the variant
    const { data, error } = await supabase
      .from('ProductVariant')
      .delete()
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete product variant', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Product variant deleted successfully', data: data[0] }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 