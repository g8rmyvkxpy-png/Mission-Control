import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST() {
  try {
    // Create second_brain table
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      query: `CREATE TABLE IF NOT EXISTS second_brain (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'note' CHECK (type IN ('note', 'link', 'book', 'idea', 'task', 'reminder', 'resource')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'done')),
        tags TEXT[],
        source TEXT,
        agent_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    });

    // If RPC doesn't work, try direct table creation via postgres
    if (createError) {
      // Try alternative - insert will create table if RLS allows
      // Let's just return success and assume table exists or will be created manually
      return NextResponse.json({ 
        message: 'Table creation skipped - please run SQL manually',
        sql: `CREATE TABLE second_brain (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'note' CHECK (type IN ('note', 'link', 'book', 'idea', 'task', 'reminder', 'resource')),
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'done')),
          tags TEXT[],
          source TEXT,
          agent_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )`
      });
    }

    // Enable realtime
    await supabaseAdmin.channel('realtime-second_brain').send({
      type: 'postgres_changes',
      event: '*',
      schema: 'public',
      table: 'second_brain'
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
