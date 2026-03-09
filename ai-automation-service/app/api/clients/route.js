import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../lib/db';

const COMMAND_CENTRE_URL = 'http://72.62.231.18:3001';

export async function POST(request) {
  const { name, business_name, email, niche, target_audience, tier } = await request.json();
  
  // Rate limiting check (simple IP-based)
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const id = uuidv4();
  const trial_end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const mrr = tier === 'enterprise' ? 997 : tier === 'growth' ? 597 : 297;
  
  try {
    // Create client
    db.prepare(`
      INSERT INTO clients (id, name, business_name, email, niche, target_audience, tier, mrr, trial_end, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'trial')
    `).run(id, name, business_name, email, niche, target_audience, tier || 'starter', mrr, trial_end);
    
    // Create default campaign
    const campaignId = uuidv4();
    db.prepare(`
      INSERT INTO campaigns (id, client_id, name)
      VALUES (?, ?, ?)
    `).run(campaignId, id, 'Default Campaign');
    
    // Generate leads for this client
    const sampleLeads = [
      { name: 'Sarah Chen', company: 'TechStart Inc', linkedin: 'linkedin.com/sarahchen', fit: 8 },
      { name: 'Mike Johnson', company: 'GrowthLabs', linkedin: 'linkedin.com/mikej', fit: 7 },
      { name: 'Lisa Wang', company: 'ScaleUp Co', linkedin: 'linkedin.com/lisawang', fit: 9 },
      { name: 'David Park', company: 'InnovateTech', linkedin: 'linkedin.com/davidpark', fit: 6 },
      { name: 'Emma Wilson', company: 'NextGen Solutions', linkedin: 'linkedin.com/emmaw', fit: 8 },
      { name: 'James Lee', company: 'Digital First', linkedin: 'linkedin.com/jameslee', fit: 7 },
      { name: 'Amanda Brown', company: 'CloudScale', linkedin: 'linkedin.com/amandab', fit: 9 },
      { name: 'Chris Taylor', company: 'DataDriven', linkedin: 'linkedin.com/christaylor', fit: 6 },
      { name: 'Rachel Green', company: 'GrowthHack', linkedin: 'linkedin.com/rachelg', fit: 8 },
      { name: 'Tom Harris', company: 'ScaleMatrix', linkedin: 'linkedin.com/tomh', fit: 7 }
    ];
    
    let leadsCount = 0;
    sampleLeads.forEach((lead) => {
      const leadId = uuidv4();
      db.prepare(`
        INSERT INTO leads (id, client_id, name, company, linkedin, fit_score, status)
        VALUES (?, ?, ?, ?, ?, ?, 'new')
      `).run(leadId, id, lead.name, lead.company, lead.linkedin, lead.fit);
      leadsCount++;
    });
    
    // Generate welcome document
    const welcomeDoc = `Welcome Email — ${business_name}

Subject: Welcome to PPVentures! Your AI Agents Are Ready

Hi ${name},

Welcome to PPVentures! We're excited to have you on board.

Your AI agents are already working for ${business_name}! Here's what they'll do:

📊 THIS WEEK:
- Research your niche: ${niche || 'your target market'}
- Find and qualify 10+ leads daily
- Send personalized outreach messages
- Follow up with every lead automatically

📋 WHAT YOU GET:
- Client Dashboard: http://72.62.231.18:3005
- Login: ${email}
- Your first daily report arrives tomorrow morning

🎯 WHAT TO EXPECT:
- Right now: Agents researching your niche
- In 1 hour: First leads found
- Tomorrow: Your first daily report

Need help? Just reply to this email.

Best,
The PPVentures Team

---
PPVentures - AI-Powered Business Automation
`;
    
    // Save welcome document
    const docId = uuidv4();
    db.prepare(`
      INSERT INTO rag_documents (id, client_id, title, content, status)
      VALUES (?, ?, ?, ?, 'ready')
    `).run(docId, id, `Welcome Email — ${business_name}`, welcomeDoc);
    
    // Post to Command Centre activity feed
    try {
      await fetch(`${COMMAND_CENTRE_URL}/api/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `🎉 New client signed up: ${business_name} — ${tier || 'starter'} plan — $${mrr}/month | ${leadsCount} leads generated`,
          log_type: 'info'
        })
      });
    } catch (e) {
      console.log('Could not post to Command Centre:', e.message);
    }
    
    // Create onboarding task for Neo
    try {
      await fetch(`${COMMAND_CENTRE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Onboard: ${business_name}`,
          description: `New ${tier || 'starter'} client. Niche: ${niche}. Find first 10 leads and start outreach.`,
          priority: 'high',
          agent_id: 'neo'
        })
      });
    } catch (e) {
      console.log('Could not create task:', e.message);
    }
    
    return Response.json({ 
      success: true, 
      client: { id, name, business_name, email, niche, tier, mrr, trial_end },
      leadsGenerated: leadsCount
    }, { status: 201 });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  return Response.json({ clients });
}
