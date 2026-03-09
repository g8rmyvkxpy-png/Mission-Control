import { db } from '../../../../lib/db';

export async function GET() {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Total active clients
    const activeClients = db.prepare(`
      SELECT COUNT(*) as count FROM clients 
      WHERE status = 'active' OR status = 'trial'
    `).get().count;
    
    // Leads found today
    const leadsToday = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE date(created_at) = date('now')
    `).get().count;
    
    // Meetings this week
    const meetingsWeek = db.prepare(`
      SELECT COUNT(*) as count FROM meetings 
      WHERE date(scheduled_at) >= date('now', '-7 days')
    `).get().count;
    
    return Response.json({
      leads_today: leadsToday || 0,
      meetings_week: meetingsWeek || 0,
      active_clients: activeClients || 0
    });
  } catch (error) {
    return Response.json({
      leads_today: 0,
      meetings_week: 0,
      active_clients: 0
    });
  }
}
