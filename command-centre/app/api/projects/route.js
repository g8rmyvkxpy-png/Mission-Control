import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/projects - list all projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (projectId) {
      // Get single project
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      // Get linked tasks
      const { data: linkedTasks } = await supabaseAdmin
        .from('project_tasks')
        .select('task_id')
        .eq('project_id', projectId);
      
      const taskIds = linkedTasks?.map(t => t.task_id) || [];
      
      let tasks = [];
      if (taskIds.length > 0) {
        const { data } = await supabaseAdmin
          .from('tasks')
          .select('*')
          .in('id', taskIds);
        tasks = data || [];
      }
      
      // Get notes
      const { data: notes } = await supabaseAdmin
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      return NextResponse.json({ project, tasks, notes: notes || [] });
    }
    
    // List all projects
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get task counts
    const projectsWithCounts = await Promise.all((projects || []).map(async (project) => {
      const { count } = await supabaseAdmin
        .from('project_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);
      return { ...project, task_count: count || 0 };
    }));
    
    return NextResponse.json({ projects: projectsWithCounts });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/projects - create project
export async function POST(request) {
  try {
    const { title, description, status, progress, priority, owner_agent_id, due_date, tags } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        title,
        description,
        status: status || 'active',
        progress: progress || 0,
        priority: priority || 'medium',
        owner_agent_id: owner_agent_id || null,
        due_date: due_date || null,
        tags: tags || null
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, project: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/projects/:id - update project
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const body = await request.json();
    
    const { title, description, status, progress, priority, owner_agent_id, due_date, tags } = body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (priority !== undefined) updateData.priority = priority;
    if (owner_agent_id !== undefined) updateData.owner_agent_id = owner_agent_id;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (tags !== undefined) updateData.tags = tags;
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, project: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/projects/:id
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
