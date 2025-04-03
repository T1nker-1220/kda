import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

/**
 * GET /api/products
 * Retrieves products with optional filtering by category, availability, etc.
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient();
    
    // Get session to check authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json(
        { error: 'Authentication error', details: sessionError.message },
        { status: 401 }
      )
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isAvailable = searchParams.get('isAvailable');
    const sortBy = searchParams.get('sortBy') || 'name';
    const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
    
    // Start query builder
    let query = supabase
      .from('Product')
      .select('*, Category(name)')
      
    // Apply filters if present
    if (categoryId) {
      query = query.eq('categoryId', categoryId)
    }
    
    if (isAvailable) {
      query = query.eq('isAvailable', isAvailable === 'true')
    }
    
    // Apply sorting
    query = query.order(sortBy as any, { ascending: order === 'asc' });
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Creates a new product - Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      return NextResponse.json(
        { error: 'Failed to verify user role', details: userError },
        { status: 500 }
      );
    }
    
    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.imageUrl || !body.basePrice || !body.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, imageUrl, basePrice, categoryId' },
        { status: 400 }
      );
    }
    
    // Verify category exists
    const { data: categoryExists, error: categoryError } = await supabase
      .from('Category')
      .select('id')
      .eq('id', body.categoryId)
      .single();
      
    if (categoryError) {
      return NextResponse.json(
        { error: 'Invalid category ID', details: categoryError },
        { status: 400 }
      );
    }
    
    // Prepare data for insertion
    const productData = {
      id: uuidv4(),
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      basePrice: parseFloat(body.basePrice),
      categoryId: body.categoryId,
      isAvailable: body.isAvailable ?? true,
      allowsAddons: body.allowsAddons ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert new product
    const { data, error } = await supabase
      .from('Product')
      .insert(productData)
      .select();
      
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create product', details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 