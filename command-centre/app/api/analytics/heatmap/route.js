import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/analytics/heatmap
// Returns: activity by hour and day of week
export async function GET(request) {
  try {
    // Get all activity logs
    const { data: logs, error } = await supabaseAdmin
      .from('activity_logs')
      .select('id, timestamp')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Build heatmap data: hour (0-23) x day (0-6, Sunday=0)
    const heatmapData = [];
    
    // Initialize all cells with 0
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({
          day, // 0 = Sunday, 6 = Saturday
          hour,
          count: 0
        });
      }
    }

    // Count logs per cell
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = date.getDay(); // This is actually day of week
      const dayOfWeek = date.getUTCDay(); // 0 = Sunday
      const hourOfDay = date.getUTCHours();
      
      const cell = heatmapData.find(d => d.day === dayOfWeek && d.hour === hourOfDay);
      if (cell) {
        cell.count++;
      }
    });

    // Group by day for easier frontend rendering
    const byDay = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    heatmapData.forEach(cell => {
      if (!byDay[cell.day]) {
        byDay[cell.day] = {
          day: cell.day,
          dayName: dayNames[cell.day],
          hours: []
        };
      }
      byDay[cell.day].hours.push({
        hour: cell.hour,
        count: cell.count
      });
    });

    return NextResponse.json({
      heatmap: Object.values(byDay),
      totalLogs: logs.length,
      maxCount: Math.max(...heatmapData.map(d => d.count), 1)
    });

  } catch (err) {
    console.error('Analytics heatmap error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
