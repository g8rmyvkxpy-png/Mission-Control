import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/search?q= - global search across all tables
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = [];
    const searchTerm = `%${q}%`;

    // Search tasks
    const { data: taskData } = await supabaseAdmin
      .from('tasks')
      .select('id, title, description, status, assigned_to, created_at')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10);
    
    if (taskData?.length) {
      results.push(...taskData.map(item => ({
        ...item,
        source: 'task',
        sourceLabel: '✅ Task',
        icon: '✅',
        url: '/dashboard/board'
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
        icon: '💾',
        url: '/dashboard/memory'
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
        icon: '📄',
        url: '/dashboard/docs'
      })));
    }

    // Search projects
    const { data: projectData } = await supabaseAdmin
      .from('projects')
      .select('id, name, description, status, created_at')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10);
    
    if (projectData?.length) {
      results.push(...projectData.map(item => ({
        ...item,
        title: item.name,
        source: 'project',
        sourceLabel: '📋 Project',
        icon: '📋',
        url: '/dashboard/projects'
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
        icon: '📡',
        url: '/dashboard/overview'
      })));
    }

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
        icon: '🧠',
        url: '/dashboard/brain'
      })));
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
