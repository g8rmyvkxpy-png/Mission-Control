import { db } from './db.js';
import { v4 as uuidv4 } from 'uuid';

// Lead Finder Agent - Runs 9am daily
// Generates 10 qualified leads per client
export function runLeadFinderAgent() {
  console.log('🔍 Running Lead Finder Agent...');
  
  const clients = db.prepare("SELECT * FROM clients WHERE status = 'active' OR status = 'trial'").all();
  
  clients.forEach(client => {
    console.log(`Finding leads for ${client.business_name}...`);
    
    // Generate 10 mock leads (in production, this would use AI/search APIs)
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
    
    sampleLeads.forEach((lead, i) => {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO leads (id, client_id, name, company, linkedin, fit_score, status)
        VALUES (?, ?, ?, ?, ?, ?, 'new')
      `).run(id, client.id, lead.name, lead.company, lead.linkedin, lead.fit);
    });
    
    console.log(`✅ Generated 10 leads for ${client.business_name}`);
  });
  
  return { success: true, leadsGenerated: clients.length * 10 };
}

// Lead Researcher Agent - Runs 10am daily
// Researches new leads and updates with pain points
export function runLeadResearcherAgent() {
  console.log('📊 Running Lead Researcher Agent...');
  
  const newLeads = db.prepare("SELECT * FROM leads WHERE status = 'new'").all();
  
  newLeads.forEach(lead => {
    // Mock research notes (in production, would use AI to research)
    const researchNotes = `Researched ${lead.name} at ${lead.company}. 
- Company size: 10-50 employees
- Likely pain points: scaling outreach, manual lead gen, low conversion rates
- Recent activity: expanding sales team
- Fit for: ${lead.fit_score >= 7 ? 'High' : 'Medium'} priority target`;
    
    db.prepare(`
      UPDATE leads SET status = 'researched', research_notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(researchNotes, lead.id);
  });
  
  console.log(`✅ Researched ${newLeads.length} leads`);
  return { success: true, leadsResearched: newLeads.length };
}

// Outreach Writer Agent - Runs 11am daily
// Writes personalized messages for researched leads
export function runOutreachWriterAgent() {
  console.log('✍️ Running Outreach Writer Agent...');
  
  const researchedLeads = db.prepare("SELECT * FROM leads l JOIN clients c ON l.client_id = c.id WHERE l.status = 'researched'").all();
  
  researchedLeads.forEach(lead => {
    // Mock personalized message (in production, would use AI to generate)
    const message = `Hi ${lead.name.split(' ')[0]},

I noticed ${lead.company} is scaling their operations and thought you might be facing the same challenge most growing businesses face: generating quality leads without spending hours on manual outreach.

At ${lead.business_name || 'our client'}, we help ${lead.niche || 'businesses'} like yours automate lead generation and personalized outreach - so you can focus on closing deals.

Would you be open to a quick 15-minute call to discuss how we're helping similar companies 3x their qualified meetings?

Best,
Sales Team`;

    const msgId = uuidv4();
    db.prepare(`
      INSERT INTO outreach_messages (id, lead_id, client_id, message, message_type, sent_at)
      VALUES (?, ?, ?, ?, 'initial', datetime('now'))
    `).run(msgId, lead.id, lead.client_id, message);
    
    // Update lead status to contacted
    db.prepare(`
      UPDATE leads SET status = 'contacted', updated_at = datetime('now')
      WHERE id = ?
    `).run(lead.id);
  });
  
  console.log(`✅ Wrote outreach messages for ${researchedLeads.length} leads`);
  return { success: true, messagesSent: researchedLeads.length };
}

// Follow-Up Manager - Runs 3pm daily
// Follows up with leads contacted 2+ days ago
export function runFollowUpManager() {
  console.log('🔄 Running Follow-Up Manager...');
  
  // Get leads contacted 2+ days ago with no reply
  const staleLeads = db.prepare(`
    SELECT * FROM leads 
    WHERE status = 'contacted' 
    AND updated_at < datetime('now', '-2 days')
  `).all();
  
  staleLeads.forEach(lead => {
    const followUpMessage = `Hi ${lead.name.split(' ')[0]},

Just following up on my previous message. I understand you're busy, so I'll keep this brief.

Are you currently struggling with lead generation? If so, I'd love to show you how we're helping companies like yours automate this process.

Let me know if you'd like to chat - happy to share case studies from similar businesses.

Best`;

    const msgId = uuidv4();
    db.prepare(`
      INSERT INTO outreach_messages (id, lead_id, client_id, message, message_type, sent_at)
      VALUES (?, ?, ?, ?, 'follow_up_1', datetime('now'))
    `).run(msgId, lead.id, lead.client_id, followUpMessage);
  });
  
  console.log(`✅ Sent follow-ups to ${staleLeads.length} leads`);
  return { success: true, followUpsSent: staleLeads.length };
}

// Daily Report Generator - Runs 6pm daily
export function runDailyReportGenerator() {
  console.log('📝 Running Daily Report Generator...');
  
  const clients = db.prepare("SELECT * FROM clients WHERE status = 'active' OR status = 'trial'").all();
  
  clients.forEach(client => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's stats
    const leadsFound = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE client_id = ? AND date(created_at) = date('now')
    `).get(client.id).count;
    
    const leadsResearched = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE client_id = ? AND status = 'researched' AND date(updated_at) = date('now')
    `).get(client.id).count;
    
    const leadsContacted = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE client_id = ? AND status = 'contacted' AND date(updated_at) = date('now')
    `).get(client.id).count;
    
    const meetingsBooked = db.prepare(`
      SELECT COUNT(*) as count FROM meetings 
      WHERE client_id = ? AND date(scheduled_at) = date('now')
    `).get(client.id).count;
    
    // Generate summary
    const summary = `Today for ${client.business_name}: Found ${leadsFound} new leads, researched ${leadsResearched} leads, sent ${leadsContacted} outreach messages, and booked ${meetingsBooked} meetings. Your AI agents are working continuously to generate qualified leads and warm up prospects. Keep up the great work!`;
    
    const reportId = uuidv4();
    db.prepare(`
      INSERT INTO daily_reports (id, client_id, report_date, leads_found, leads_researched, leads_contacted, meetings_booked, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(reportId, client.id, today, leadsFound, leadsResearched, leadsContacted, meetingsBooked, summary);
    
    console.log(`✅ Generated daily report for ${client.business_name}`);
  });
  
  return { success: true, reportsGenerated: clients.length };
}

// Run all agents
export async function runAllAgents() {
  console.log('🤖 Running all AI agents...');
  const results = {
    leadFinder: runLeadFinderAgent(),
    leadResearcher: runLeadResearcherAgent(),
    outreachWriter: runOutreachWriterAgent(),
    followUp: runFollowUpManager(),
    dailyReport: runDailyReportGenerator()
  };
  return results;
}
