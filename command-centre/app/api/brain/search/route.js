import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/brain/search?q= - global search across all tables
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = [];
    const searchTerm = `%${q}%`;

    // Search second_brain
    const { data: brainData } = await supabaseAdmin
      .from('second_brain')
      .select('id, title, content, type, created_at')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .limit(10);
    
    if (brainData?.length) {
      results.push(...brainData.map(item => ({
        ...item,
        source: 'brain',
        sourceLabel: '🧠 Brain',
        table: 'second_brain'
      })));
    }

    // Search memories
    const { data: memoryData } = await supabaseAdmin
      .from('memories')
      .select('id, title, content, created_at')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .limit(10);
    
    if (memoryData?.length) {
      results.push(...memoryData.map(item => ({
        ...item,
        source: 'memory',
        sourceLabel: '💾 Memory',
        table: 'memories'
      })));
    }

    // Search documents
    const { data: docData } = await supabaseAdmin
      .from('documents')
      .select('id, title, content, created_at')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .limit(10);
    
    if (docData?.length) {
      results.push(...docData.map(item => ({
        ...item,
        source: 'doc',
        sourceLabel: '📄 Doc',
        table: 'documents'
      })));
    }

    // Search tasks
    const { data: taskData } = await supabaseAdmin
      .from('tasks')
      .select('id, title, description, status, created_at')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10);
    
    if (taskData?.length) {
      results.push(...taskData.map(item => ({
        ...item,
        source: 'task',
        sourceLabel: '✅ Task',
        table: 'tasks'
      })));
    }

    // Search activity_logs
    const { data: logData } = await supabaseAdmin
      .from('activity_logs')
      .select('id, message, log_type, created_at')
      .ilike('message', searchTerm)
      .limit(10);
    
    if (logData?.length) {
      results.push(...logData.map(item => ({
        ...item,
        title: item.message?.substring(0, 50),
        content: item.message,
        source: 'activity',
        sourceLabel: '📡 Activity',
        table: 'activity_logs'
      })));
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
