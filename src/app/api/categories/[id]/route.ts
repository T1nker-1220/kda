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
 * GET /api/categories/[id]
 * Retrieves a specific category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      // Not found should return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching category:', error)
      return NextResponse.json(
        { error: 'Failed to fetch category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories/[id]
 * Updates a specific category
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
      ...(body.description && { description: body.description }),
      ...(body.imageUrl && { imageUrl: body.imageUrl }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      updatedAt: new Date().toISOString()
    }
    
    // Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('Category')
      .select('id')
      .eq('id', id)
      .single()
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      
      console.error('Error checking category:', checkError)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    }
    
    // Update the category
    const { data, error } = await supabase
      .from('Category')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id]
 * Deletes a specific category
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
    
    // Check if category has associated products
    const { data: relatedProducts, error: productError } = await supabase
      .from('Product')
      .select('id')
      .eq('categoryId', id)
      
    if (productError) {
      console.error('Error checking related products:', productError)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    }
    
    // Prevent deletion if products are associated
    if (relatedProducts && relatedProducts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with associated products',
          productCount: relatedProducts.length
        },
        { status: 409 }
      )
    }
    
    // Delete the category
    const { error } = await supabase
      .from('Category')
      .delete()
      .eq('id', id)
    
    if (error) {
      // If not found, return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      
      console.error('Error deleting category:', error)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 