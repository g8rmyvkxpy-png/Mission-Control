import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/analytics/agent-summary
// Returns: full agent productivity breakdown
export async function GET(request) {
  try {
    // Get all agents
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .order('name');

    if (agentsError) throw agentsError;

    // Get all tasks with status
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, status, priority, created_at, updated_at');

    if (tasksError) throw tasksError;

    // Get activity logs count per agent
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('activity_logs')
      .select('id, agent_id, timestamp');

    if (logsError) throw logsError;

    // Build agent summary
    const agentSummary = agents.map(agent => {
      const agentTasks = tasks.filter(t => t.assigned_to === agent.id);
      const agentLogs = logs.filter(l => l.agent_id === agent.id);
      
      const completedTasks = agentTasks.filter(t => t.status === 'done');
      const inProgressTasks = agentTasks.filter(t => t.status === 'in-progress');
      const backlogTasks = agentTasks.filter(t => t.status === 'backlog');
      
      // Calculate avg completion time
      const completionTimes = completedTasks
        .map(t => (new Date(t.updated_at) - new Date(t.created_at)) / (1000 * 60))
        .filter(t => t > 0);
      
      const avgCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      // Priority breakdown for completed tasks
      const priorityBreakdown = {
        high: completedTasks.filter(t => t.priority === 'high').length,
        medium: completedTasks.filter(t => t.priority === 'medium').length,
        low: completedTasks.filter(t => t.priority === 'low').length
      };

      return {
        id: agent.id,
        name: agent.name,
        avatar_color: agent.avatar_color,
        status: agent.status,
        last_heartbeat: agent.last_heartbeat,
        tasks_completed: completedTasks.length,
        tasks_in_progress: inProgressTasks.length,
        tasks_in_backlog: backlogTasks.length,
        total_logs: agentLogs.length,
        avg_completion_time_minutes: Math.round(avgCompletionTime),
        priority_breakdown: priorityBreakdown
      };
    });

    // Sort by tasks completed
    agentSummary.sort((a, b) => b.tasks_completed - a.tasks_completed);

    return NextResponse.json({
      agents: agentSummary,
      totalAgents: agents.length,
      totalTasksCompleted: tasks.filter(t => t.status === 'done').length,
      totalTasksInProgress: tasks.filter(t => t.status === 'in-progress').length,
      totalTasksInBacklog: tasks.filter(t => t.status === 'backlog').length
    });

  } catch (err) {
    console.error('Analytics agent-summary error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
