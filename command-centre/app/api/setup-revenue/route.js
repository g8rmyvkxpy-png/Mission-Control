import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// This endpoint runs the revenue schema - call once to setup
export async function POST() {
  try {
    const results = {};
    
    // Create revenue_entries table
    const { error: revenueError } = await supabaseAdmin.from('revenue_entries').select('id').limit(1);
    if (revenueError?.code === '42P01') { // Table doesn't exist
      await supabaseAdmin.rpc('create_revenue_entries_table', {});
    }
    results.revenue_entries = 'exists or created';
    
    // Check if revenue_entries exists, if not create via direct insert attempt to trigger creation
    try {
      await supabaseAdmin.from('revenue_entries').insert({
        amount: 0,
        source: 'setup',
        status: 'confirmed'
      }, { upsert: false });
    } catch (e) {
      // Expected to fail on first run if table doesn't exist
    }
    
    // Try pipeline table
    try {
      await supabaseAdmin.from('pipeline').select('id').limit(1);
      results.pipeline = 'exists';
    } catch (e) {
      results.pipeline = 'needs creation';
    }
    
    // Try milestones table  
    try {
      await supabaseAdmin.from('milestones').select('id').limit(1);
      results.milestones = 'exists';
    } catch (e) {
      results.milestones = 'needs creation';
    }
    
    return NextResponse.json({ 
      message: 'Schema check complete. Use Supabase Dashboard to run REVENUE_SCHEMA.sql',
      results,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Run the SQL from REVENUE_SCHEMA.sql in Supabase Dashboard',
    schema: 'https://github.com/.../REVENUE_SCHEMA.sql'
  });
}
