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
 * GET /api/addons/[id]
 * Retrieves a specific global addon by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    const { data, error } = await supabase
      .from('GlobalAddon')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      // Not found should return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Global addon not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch global addon', details: error },
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
 * PUT /api/addons/[id]
 * Updates a specific global addon
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
    
    // Prepare update data
    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      updatedAt: new Date().toISOString()
    }
    
    // Check if addon exists
    const { data: existingAddon, error: checkError } = await supabase
      .from('GlobalAddon')
      .select('id')
      .eq('id', id)
      .single()
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Global addon not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to check addon existence', details: checkError },
        { status: 500 }
      )
    }
    
    // Update the addon
    const { data, error } = await supabase
      .from('GlobalAddon')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update global addon', details: error },
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
 * DELETE /api/addons/[id]
 * Deletes a specific global addon
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
    
    // Check if addon has associated order item addons
    const { data: relatedOrderItemAddons, error: relationError } = await supabase
      .from('OrderItemAddon')
      .select('id')
      .eq('addonId', id)
      
    if (relationError) {
      return NextResponse.json(
        { error: 'Failed to check related order items', details: relationError },
        { status: 500 }
      )
    }
    
    // Prevent deletion if order item addons are associated
    if (relatedOrderItemAddons && relatedOrderItemAddons.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete addon with associated orders',
          orderItemCount: relatedOrderItemAddons.length
        },
        { status: 409 }
      )
    }
    
    // Delete the addon
    const { data, error } = await supabase
      .from('GlobalAddon')
      .delete()
      .eq('id', id)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete global addon', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Global addon deleted successfully', data: data[0] }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 