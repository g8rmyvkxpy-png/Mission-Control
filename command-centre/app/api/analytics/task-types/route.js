import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/analytics/task-types
// Returns: breakdown of task priorities completed
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'all'; // today, week, month, all
    
    let startDate = null;
    const now = new Date();
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = null;
    }

    // Build query
    let query = supabaseAdmin
      .from('tasks')
      .select('id, status, priority, created_at, updated_at')
      .eq('status', 'done');

    if (startDate) {
      query = query.gte('updated_at', startDate.toISOString());
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    // Count by priority
    const priorityBreakdown = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // Also get status breakdown (all tasks, not just done)
    let allQuery = supabaseAdmin
      .from('tasks')
      .select('id, status, priority');

    if (startDate) {
      allQuery = allQuery.gte('created_at', startDate.toISOString());
    }

    const { data: allTasks } = await allQuery;

    const statusBreakdown = {
      done: allTasks.filter(t => t.status === 'done').length,
      'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
      backlog: allTasks.filter(t => t.status === 'backlog').length,
      review: allTasks.filter(t => t.status === 'review').length
    };

    // Format for pie chart
    const pieData = [
      { name: 'High Priority', value: priorityBreakdown.high, color: '#ef4444' },
      { name: 'Medium Priority', value: priorityBreakdown.medium, color: '#f59e0b' },
      { name: 'Low Priority', value: priorityBreakdown.low, color: '#10b981' }
    ].filter(d => d.value > 0);

    return NextResponse.json({
      priorityBreakdown,
      statusBreakdown,
      pieData,
      totalCompleted: tasks.length,
      timeRange
    });

  } catch (err) {
    console.error('Analytics task-types error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
