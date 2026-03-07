import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/analytics/overview
// Returns: Total tasks completed today/this week/this month, Total tasks per agent, Average task completion time, Most productive agent, Total memories saved, docs created
export async function GET(request) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Tasks completed today
    const { data: todayTasks, error: todayError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, created_at, updated_at')
      .eq('status', 'done')
      .gte('updated_at', startOfToday);

    if (todayError) throw todayError;

    // Tasks completed this week
    const { data: weekTasks, error: weekError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, created_at, updated_at')
      .eq('status', 'done')
      .gte('updated_at', startOfWeek);

    if (weekError) throw weekError;

    // Tasks completed this month
    const { data: monthTasks, error: monthError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, created_at, updated_at')
      .eq('status', 'done')
      .gte('updated_at', startOfMonth);

    if (monthError) throw monthError;

    // Tasks per agent
    const { data: allTasks, error: allTasksError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, status, created_at, updated_at')
      .eq('status', 'done');

    if (allTasksError) throw allTasksError;

    // Group by agent
    const tasksByAgent = {};
    const agentNames = {};
    
    // Get all agents
    const { data: agents } = await supabaseAdmin
      .from('agents')
      .select('id, name');
    
    if (agents) {
      agents.forEach(a => { agentNames[a.id] = a.name; });
    }

    allTasks.forEach(task => {
      if (!tasksByAgent[task.assigned_to]) {
        tasksByAgent[task.assigned_to] = 0;
      }
      tasksByAgent[task.assigned_to]++;
    });

    const tasksPerAgent = Object.entries(tasksByAgent).map(([agentId, count]) => ({
      agentId,
      agentName: agentNames[agentId] || 'Unknown',
      count
    })).sort((a, b) => b.count - a.count);

    // Calculate average task completion time
    let avgCompletionTime = 0;
    const completionTimes = allTasks
      .map(t => {
        const created = new Date(t.created_at);
        const updated = new Date(t.updated_at);
        return (updated - created) / (1000 * 60); // minutes
      })
      .filter(t => t > 0);
    
    if (completionTimes.length > 0) {
      avgCompletionTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
    }

    // Most productive agent
    const mostProductiveAgent = tasksPerAgent.length > 0 ? {
      agentId: tasksPerAgent[0].agentId,
      agentName: tasksPerAgent[0].agentName,
      taskCount: tasksPerAgent[0].count
    } : null;

    // Total memories saved
    const { count: memoriesCount } = await supabaseAdmin
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    // Total docs created (from docs table)
    const { count: docsCount } = await supabaseAdmin
      .from('docs')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    return NextResponse.json({
      tasksCompletedToday: todayTasks?.length || 0,
      tasksCompletedThisWeek: weekTasks?.length || 0,
      tasksCompletedThisMonth: monthTasks?.length || 0,
      tasksPerAgent,
      avgCompletionTimeMinutes: Math.round(avgCompletionTime),
      mostProductiveAgent,
      totalMemories: memoriesCount || 0,
      totalDocs: docsCount || 0
    });

  } catch (err) {
    console.error('Analytics overview error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
