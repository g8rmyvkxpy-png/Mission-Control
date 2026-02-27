import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/organizations - Get org by clerk_org_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clerkOrgId = searchParams.get('clerk_org_id');
    
    if (!clerkOrgId) {
      return NextResponse.json({ 
        organizations: [],
        message: 'No org specified. Add ?clerk_org_id=xxx' 
      });
    }
    
    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('clerk_org_id', clerkOrgId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!org) {
      return NextResponse.json({ organization: null, exists: false });
    }
    
    return NextResponse.json({ organization: org, exists: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/organizations - Create organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerk_org_id, name, plan = 'starter' } = body;
    
    if (!clerk_org_id || !name) {
      return NextResponse.json({ error: 'clerk_org_id and name required' }, { status: 400 });
    }
    
    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .insert({ clerk_org_id, name, plan })
      .select()
      .single();
    
    if (error) {
      // Organization already exists
      if (error.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('organizations')
          .select('*')
          .eq('clerk_org_id', clerk_org_id)
          .single();
        return NextResponse.json({ organization: existing, existing: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ organization: org, created: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
