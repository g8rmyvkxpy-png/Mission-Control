import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/collaboration/summary - returns active collaborations
export async function GET() {
  try {
    // Get all parent tasks that have subtasks
    const { data: subtasks, error } = await supabaseAdmin
      .from('subtasks')
      .select(`
        *,
        parent_task:tasks!parent_task_id(id, title, status),
        child_task:tasks!child_task_id(id, title, status, assigned_to, agent:agents(name, avatar_color))
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ collaborations: [], error: error.message }, { status: 200 });
    }
    
    // Group by parent task
    const collaborations = {};
    for (const st of subtasks || []) {
      const parentId = st.parent_task_id;
      if (!collaborations[parentId]) {
        collaborations[parentId] = {
          parent_task: st.parent_task,
          subtasks: [],
          allDone: st.parent_task?.status === 'done'
        };
      }
      collaborations[parentId].subtasks.push(st.child_task);
      if (st.child_task?.status !== 'done') {
        collaborations[parentId].allDone = false;
      }
    }
    
    return NextResponse.json({ 
      collaborations: Object.values(collaborations),
      activeCount: Object.values(collaborations).filter(c => !c.allDone).length
    });
  } catch (err) {
    return NextResponse.json({ collaborations: [], error: err.message }, { status: 200 });
  }
}
