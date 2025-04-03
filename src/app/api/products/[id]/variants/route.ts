import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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
 * GET /api/products/[id]/variants
 * Retrieves all variants for a specific product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('id')
      .eq('id', id)
      .single()
      
    if (productError) {
      // Not found should return 404
      if (productError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to verify product', details: productError },
        { status: 500 }
      )
    }
    
    // Get variants for the product
    const { data, error } = await supabase
      .from('ProductVariant')
      .select('*')
      .eq('productId', id)
      .order('name')
      
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch variants', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products/[id]/variants
 * Creates a new variant for a specific product
 */
export async function POST(
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
    
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('id')
      .eq('id', id)
      .single()
      
    if (productError) {
      if (productError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to verify product', details: productError },
        { status: 500 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.type || body.price === undefined || body.stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, price, stock' },
        { status: 400 }
      )
    }
    
    // Validate variant type
    if (!['SIZE', 'FLAVOR'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid variant type. Must be either SIZE or FLAVOR' },
        { status: 400 }
      )
    }
    
    // Prepare data for insertion
    const variantData = {
      id: uuidv4(),
      productId: id,
      name: body.name,
      type: body.type,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
      imageUrl: body.imageUrl || null,
      isAvailable: body.isAvailable ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Insert new variant
    const { data, error } = await supabase
      .from('ProductVariant')
      .insert(variantData)
      .select()
      
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create variant', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 