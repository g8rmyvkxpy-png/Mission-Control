/**
 * RPA Cron Jobs - Automated tasks for clients
 */

const fetch = require('node-fetch');
const rpaEngine = require('./lib/rpaEngine');

const COMMAND_CENTRE_URL = 'http://72.62.231.18:3001';
const AUTOMATION_DB = require('better-sqlite3')('/home/deva/.openclaw/workspace/ai-automation-service/data/automation.db');

// Daily Lead Scraper - 9am
async function runDailyLeadScraper() {
  console.log('[RPA Cron] Running Daily Lead Scraper...');
  
  const clients = AUTOMATION_DB.prepare(`
    SELECT * FROM clients WHERE status = 'active' OR status = 'trial'
  `).all();
  
  for (const client of clients) {
    try {
      // Search Google for leads
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(client.niche + ' companies ' + client.target_audience)}`;
      
      const rpaResult = await executeRPATask(
        `Scrape company listings for ${client.business_name} niche`,
        searchUrl,
        client.id
      );
      
      console.log(`[RPA] Found leads for ${client.business_name}: ${rpaResult.success ? 'success' : 'failed'}`);
    } catch (e) {
      console.error(`[RPA] Lead scraper error for ${client.business_name}:`, e.message);
    }
  }
  
  return { success: true, clientsProcessed: clients.length };
}

// Competitor Monitor - 10am  
async function runCompetitorMonitor() {
  console.log('[RPA Cron] Running Competitor Monitor...');
  
  const clients = AUTOMATION_DB.prepare(`
    SELECT * FROM clients WHERE status = 'active' OR status = 'trial'
  `).all();
  
  for (const client of clients) {
    try {
      // Visit example competitor sites (in production, would be stored per client)
      const competitors = ['example.com', 'competitor.com'];
      
      for (const comp of competitors) {
        const rpaResult = await executeRPATask(
          `Extract homepage headline, pricing, and features from ${comp}`,
          `https://${comp}`,
          client.id
        );
        
        console.log(`[RPA] Monitored ${comp} for ${client.business_name}`);
      }
    } catch (e) {
      console.error(`[RPA] Competitor monitor error:`, e.message);
    }
  }
  
  return { success: true, clientsProcessed: clients.length };
}

// Industry News Scraper - 8am
async function runNewsScraper() {
  console.log('[RPA Cron] Running Industry News Scraper...');
  
  const clients = AUTOMATION_DB.prepare(`
    SELECT * FROM clients WHERE status = 'active' OR status = 'trial'
  `).all();
  
  for (const client of clients) {
    try {
      const newsUrl = `https://news.google.com/search?q=${encodeURIComponent(client.niche)}`;
      
      const rpaResult = await executeRPATask(
        `Extract top 5 news headlines about ${client.niche}`,
        newsUrl,
        client.id
      );
      
      console.log(`[RPA] News scraped for ${client.business_name}`);
    } catch (e) {
      console.error(`[RPA] News scraper error:`, e.message);
    }
  }
  
  return { success: true, clientsProcessed: clients.length };
}

// Weekly Website Audit - Monday 9am
async function runWebsiteAudit() {
  console.log('[RPA Cron] Running Weekly Website Audit...');
  
  const clients = AUTOMATION_DB.prepare(`
    SELECT * FROM clients WHERE status = 'active' OR status = 'trial' AND website IS NOT NULL
  `).all();
  
  for (const client of clients) {
    try {
      if (client.website) {
        const rpaResult = await executeRPATask(
          'Check page load, broken links, meta description',
          client.website,
          client.id
        );
        
        console.log(`[RPA] Website audit for ${client.business_name}: ${rpaResult.success ? 'complete' : 'failed'}`);
      }
    } catch (e) {
      console.error(`[RPA] Website audit error:`, e.message);
    }
  }
  
  return { success: true, clientsProcessed: clients.length };
}

// Helper to execute RPA task
async function executeRPATask(instructions, targetUrl, clientId) {
  try {
    const res = await fetch(`${COMMAND_CENTRE_URL}/api/rpa/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_type: 'scrape',
        target_url: targetUrl,
        instructions,
        client_id: clientId,
        agent_id: 'system'
      })
    });
    
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  runDailyLeadScraper,
  runCompetitorMonitor, 
  runNewsScraper,
  runWebsiteAudit
};
