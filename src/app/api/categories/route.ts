import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

/**
 * GET /api/categories
 * Retrieves all categories sorted by sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/categories: Starting request');

    // Debug cookie information
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll().map(c => c.name)
    console.log('All cookies in categories API:', allCookies)
    
    // Get Supabase project ref from environment URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || ''
    
    // Check for Supabase auth cookies
    const authCookies = cookieStore.getAll().filter(c => 
      c.name.startsWith(`sb-${projectRef}-auth-token`)
    )
    console.log('Auth cookies found in categories API:', authCookies.length)

    // Create Supabase client
    const supabase = createServerClient();
    
    // Get session to check authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error in categories API:', sessionError.message)
      return NextResponse.json(
        { error: 'Authentication error', details: sessionError.message },
        { status: 401 }
      )
    }
    
    // Log authentication status
    console.log('Session exists in categories API:', !!session)
    if (!session) {
      console.log('No active session found - user not authenticated')
      return NextResponse.json(
        { error: 'Authentication required to access categories' },
        { status: 401 }
      )
    }
    
    // Check for query parameters like sortBy, order, etc.
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
    
    console.log(`GET /api/categories: Querying with sortBy=${sortBy}, order=${order}`);
    
    // Debug: Log the Supabase URL to confirm it's correct
    console.log(`Using Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .order(sortBy as any, { ascending: order === 'asc' });
    
    if (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', JSON.stringify(error));
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error },
        { status: 500 }
      );
    }
    
    console.log(`GET /api/categories: Success, found ${data?.length || 0} categories`);
    console.log('Categories data sample:', data?.slice(0, 2));
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/categories:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Creates a new category
 */
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/categories: Starting request');
    
    const supabase = createServerClient();
    
    // Verify user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('POST /api/categories: Unauthorized - no user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`POST /api/categories: User authenticated with ID ${user.id}`);
    
    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      console.error('Error fetching user role:', userError);
      return NextResponse.json(
        { error: 'Failed to verify user role', details: userError },
        { status: 500 }
      );
    }
    
    if (!userData || userData.role !== 'ADMIN') {
      console.log(`POST /api/categories: Forbidden - user role is ${userData?.role || 'unknown'}`);
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    console.log('POST /api/categories: Request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.name || !body.description || !body.imageUrl) {
      console.log('POST /api/categories: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: name, description, imageUrl' },
        { status: 400 }
      );
    }
    
    // Prepare data for insertion
    const categoryData = {
      id: uuidv4(),
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('POST /api/categories: Inserting new category');
    
    // Insert new category
    const { data, error } = await supabase
      .from('Category')
      .insert(categoryData)
      .select();
      
    if (error) {
      console.error('Error creating category:', error);
      console.error('Error details:', JSON.stringify(error));
      return NextResponse.json(
        { error: 'Failed to create category', details: error },
        { status: 500 }
      );
    }
    
    console.log('POST /api/categories: Category created successfully');
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/categories:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 