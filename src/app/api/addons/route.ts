import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET /api/addons
 * Retrieves all global addons with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isAvailable = searchParams.get('isAvailable');
    const sortBy = searchParams.get('sortBy') || 'name';
    const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
    
    // Start query builder
    let query = supabase
      .from('GlobalAddon')
      .select('*')
      
    // Apply filters if present
    if (isAvailable) {
      query = query.eq('isAvailable', isAvailable === 'true')
    }
    
    // Apply sorting
    query = query.order(sortBy as any, { ascending: order === 'asc' });
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch global addons', details: error },
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
 * POST /api/addons
 * Creates a new global addon - Admin only
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
    if (!body.name || body.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price' },
        { status: 400 }
      );
    }
    
    // Prepare data for insertion
    const addonData = {
      id: uuidv4(),
      name: body.name,
      price: parseFloat(body.price),
      isAvailable: body.isAvailable ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert new addon
    const { data, error } = await supabase
      .from('GlobalAddon')
      .insert(addonData)
      .select();
      
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create global addon', details: error },
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