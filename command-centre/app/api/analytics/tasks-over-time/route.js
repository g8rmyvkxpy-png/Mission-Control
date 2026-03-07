import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/analytics/tasks-over-time?days=30
// Returns: tasks completed per day for last N days per agent
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all done tasks within the date range
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, updated_at, status')
      .eq('status', 'done')
      .gte('updated_at', startDate.toISOString())
      .order('updated_at', { ascending: true });

    if (error) throw error;

    // Get all agents
    const { data: agents } = await supabaseAdmin
      .from('agents')
      .select('id, name, avatar_color');

    const agentMap = {};
    agents?.forEach(a => { agentMap[a.id] = a; });

    // Group by date and agent
    const dataByDate = {};
    
    tasks.forEach(task => {
      const date = new Date(task.updated_at).toISOString().split('T')[0];
      const agentId = task.assigned_to;
      
      if (!dataByDate[date]) {
        dataByDate[date] = {};
      }
      if (!dataByDate[date][agentId]) {
        dataByDate[date][agentId] = 0;
      }
      dataByDate[date][agentId]++;
    });

    // Convert to array format for chart
    const dates = Object.keys(dataByDate).sort();
    const agentIds = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))];
    
    const result = dates.map(date => {
      const row = { date };
      agentIds.forEach(agentId => {
        row[agentMap[agentId]?.name || agentId] = dataByDate[date][agentId] || 0;
      });
      return row;
    });

    // Add agent info
    const agentInfo = agentIds.map(id => ({
      id,
      name: agentMap[id]?.name || 'Unknown',
      avatar_color: agentMap[id]?.avatar_color || '#10b981'
    }));

    return NextResponse.json({
      data: result,
      agents: agentInfo,
      totalDays: dates.length
    });

  } catch (err) {
    console.error('Analytics tasks-over-time error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
