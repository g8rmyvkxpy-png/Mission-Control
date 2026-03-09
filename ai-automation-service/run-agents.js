import cron from 'node-cron';
import { runLeadFinderAgent, runLeadResearcherAgent, runOutreachWriterAgent, runFollowUpManager, runDailyReportGenerator } from './lib/agents.js';

console.log('🤖 PPVentures AI Agents - Cron Scheduler');
console.log('==========================================\n');

// Schedule all agents
// Lead Finder - 9am daily
cron.schedule('0 9 * * *', () => {
  console.log('\n🕘 Running scheduled: Lead Finder (9am)');
  runLeadFinderAgent();
}, {
  scheduled: true,
  timezone: 'UTC'
});

// Lead Researcher - 10am daily  
cron.schedule('0 10 * * *', () => {
  console.log('\n🕙 Running scheduled: Lead Researcher (10am)');
  runLeadResearcherAgent();
}, {
  scheduled: true,
  timezone: 'UTC'
});

// Outreach Writer - 11am daily
cron.schedule('0 11 * * *', () => {
  console.log('\n🕚 Running scheduled: Outreach Writer (11am)');
  runOutreachWriterAgent();
}, {
  scheduled: true,
  timezone: 'UTC'
});

// Follow-Up Manager - 3pm daily
cron.schedule('0 15 * * *', () => {
  console.log('\n🕔 Running scheduled: Follow-Up Manager (3pm)');
  runFollowUpManager();
}, {
  scheduled: true,
  timezone: 'UTC'
});

// Daily Report - 6pm daily
cron.schedule('0 18 * * *', () => {
  console.log('\n🕕 Running scheduled: Daily Report Generator (6pm)');
  runDailyReportGenerator();
}, {
  scheduled: true,
  timezone: 'UTC'
});

console.log('✅ All cron jobs scheduled:');
console.log('   • Lead Finder: 9am UTC');
console.log('   • Lead Researcher: 10am UTC');
console.log('   • Outreach Writer: 11am UTC');
console.log('   • Follow-Up Manager: 3pm UTC');
console.log('   • Daily Report: 6pm UTC');
console.log('\n⏳ Waiting for scheduled runs...\n');

// Also run once on startup for testing
console.log('🔄 Running initial agent execution for testing...');
runLeadFinderAgent();
runLeadResearcherAgent();
runOutreachWriterAgent();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down cron scheduler...');
  process.exit(0);
});
