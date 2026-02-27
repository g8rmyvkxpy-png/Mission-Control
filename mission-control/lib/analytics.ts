import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface OrgAnalytics {
  overview: {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    pendingTasks: number;
    workflowsRun: number;
  };
  taskMetrics: {
    completionRate: number;
    avgCompletionTime: number;
    tasksByDay: { date: string; count: number }[];
  };
  agentMetrics: {
    agentId: string;
    agentName: string;
    tasksCompleted: number;
    avgDuration: number;
  }[];
}

export async function getOrgAnalytics(orgId: string): Promise<OrgAnalytics> {
  // Get agents
  const { data: agents } = await supabaseAdmin
    .from('managed_agents')
    .select('*')
    .eq('organization_id', orgId);
  
  // Get tasks
  const { data: tasks } = await supabaseAdmin
    .from('agent_tasks')
    .select('*')
    .eq('organization_id', orgId);
  
  // Get workflows
  const { data: workflows } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('organization_id', orgId);
  
  const agentList = agents || [];
  const taskList = tasks || [];
  const workflowList = workflows || [];
  
  // Calculate metrics
  const completedTasks = taskList.filter(t => t.status === 'completed').length;
  const failedTasks = taskList.filter(t => t.status === 'failed').length;
  const pendingTasks = taskList.filter(t => t.status === 'pending').length;
  
  // Avg completion time
  const completedWithTime = taskList.filter(t => t.completed_at && t.started_at);
  let avgCompletionTime = 0;
  if (completedWithTime.length > 0) {
    const totalTime = completedWithTime.reduce((sum, t) => {
      const start = new Date(t.started_at).getTime();
      const end = new Date(t.completed_at).getTime();
      return sum + (end - start);
    }, 0);
    avgCompletionTime = totalTime / completedWithTime.length / 1000; // seconds
  }
  
  // Tasks by day (last 7 days)
  const tasksByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    tasksByDay[dateKey] = 0;
  }
  taskList.forEach(t => {
    const dateKey = t.created_at.split('T')[0];
    if (tasksByDay[dateKey] !== undefined) {
      tasksByDay[dateKey]++;
    }
  });
  
  // Agent metrics
  const agentMetrics = agentList.map(agent => {
    const agentTasks = taskList.filter(t => t.agent_id === agent.id && t.status === 'completed');
    const tasksWithTime = agentTasks.filter(t => t.completed_at && t.started_at);
    let avgDuration = 0;
    if (tasksWithTime.length > 0) {
      const totalTime = tasksWithTime.reduce((sum, t) => {
        const start = new Date(t.started_at).getTime();
        const end = new Date(t.completed_at).getTime();
        return sum + (end - start);
      }, 0);
      avgDuration = totalTime / tasksWithTime.length / 1000;
    }
    return {
      agentId: agent.id,
      agentName: agent.name,
      tasksCompleted: agentTasks.length,
      avgDuration
    };
  });
  
  return {
    overview: {
      totalAgents: agentList.length,
      activeAgents: agentList.filter(a => a.status === 'active').length,
      totalTasks: taskList.length,
      completedTasks,
      failedTasks,
      pendingTasks,
      workflowsRun: workflowList.filter(w => w.last_run_at).length
    },
    taskMetrics: {
      completionRate: taskList.length > 0 ? (completedTasks / taskList.length) * 100 : 0,
      avgCompletionTime,
      tasksByDay: Object.entries(tasksByDay).map(([date, count]) => ({ date, count }))
    },
    agentMetrics
  };
}

// Get activity feed
export async function getActivityFeed(orgId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('agent_activity')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { activities: data || [], error };
}
