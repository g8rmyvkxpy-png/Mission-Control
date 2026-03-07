import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Try to create tables if they don't exist
    const tables = ['projects', 'project_tasks', 'project_notes'];
    const results = {};
    
    for (const table of tables) {
      try {
        // Try to insert a dummy record to see if table exists
        const { error } = await supabaseAdmin
          .from(table)
          .select('id')
          .limit(1);
        
        results[table] = error ? 'missing' : 'exists';
      } catch (e) {
        results[table] = 'error: ' + e.message;
      }
    }
    
    return NextResponse.json({ status: results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
