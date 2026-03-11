import { supabase } from './supabase'

// ============ LEADS ============

// Fetch leads for a user
export async function fetchLeads(userId) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Fetch leads grouped by status
export async function fetchLeadsByStatus(userId) {
  const leads = await fetchLeads(userId)
  return {
    new: leads.filter(l => l.status === 'new'),
    contacted: leads.filter(l => l.status === 'contacted'),
    replied: leads.filter(l => l.status === 'replied'),
    meeting: leads.filter(l => l.status === 'meeting')
  }
}

// Update lead status
export async function updateLeadStatus(leadId, userId, newStatus) {
  const { error } = await supabase
    .from('leads')
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .eq('user_id', userId)

  if (error) throw error
}

// Update lead notes
export async function updateLeadNotes(leadId, userId, notes) {
  const { error } = await supabase
    .from('leads')
    .update({ 
      notes, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .eq('user_id', userId)

  if (error) throw error
}

// Update lead outreach draft
export async function updateLeadOutreach(leadId, userId, outreachDraft) {
  const { error } = await supabase
    .from('leads')
    .update({ 
      outreach_draft: outreachDraft, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .eq('user_id', userId)

  if (error) throw error
}

// Delete lead
export async function deleteLead(leadId, userId) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
    .eq('user_id', userId)

  if (error) throw error
}

// Insert seed leads for new users
export async function seedSampleLeads(userId, targetNiche = 'your target niche') {
  const sampleLeads = [
    {
      user_id: userId,
      name: 'Sample Lead 1',
      email: 'contact@example.com',
      company: 'Example Corp',
      company_url: 'https://example.com',
      lead_score: 8,
      score_reasoning: 'Sample lead — replace with real leads when Neo runs.',
      source_url: 'https://example.com',
      outreach_draft: `Hi there,\n\nI came across Example Corp and was impressed by your work. I help businesses like yours with growth.\n\nWould you be open to a quick 15-minute chat this week?\n\nBest regards`,
      status: 'new',
      scraped_by: 'system'
    },
    {
      user_id: userId,
      name: 'Sample Lead 2',
      email: 'hello@startup.io',
      company: 'Startup IO',
      company_url: 'https://startup.io',
      lead_score: 7,
      score_reasoning: 'Sample lead — replace with real leads when Neo runs.',
      source_url: 'https://startup.io',
      outreach_draft: `Hi there,\n\nI came across Startup IO and was impressed by your growth. I help businesses like yours scale faster.\n\nWould you be open to a quick chat?\n\nBest regards`,
      status: 'new',
      scraped_by: 'system'
    },
    {
      user_id: userId,
      name: 'Sample Lead 3',
      email: 'team@agency.co',
      company: 'Digital Agency Co',
      company_url: 'https://agency.co',
      lead_score: 9,
      score_reasoning: 'Sample lead — replace with real leads when Neo runs.',
      source_url: 'https://agency.co',
      outreach_draft: `Hi there,\n\nI help agencies like Digital Agency Co win more clients. Would love to chat about how we could help.\n\nBest regards`,
      status: 'new',
      scraped_by: 'system'
    }
  ]

  const { error } = await supabase.from('leads').insert(sampleLeads)
  if (error) throw error
}

// ============ COMPETITORS ============

// Fetch competitors
export async function fetchCompetitors(userId) {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Add competitor
export async function addCompetitor(userId, url) {
  // Normalize URL
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  // Check limit
  const { count } = await supabase
    .from('competitors')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (count >= 5) throw new Error('Maximum 5 competitors allowed')

  // Extract domain as name
  const name = new URL(normalizedUrl).hostname

  const { data, error } = await supabase
    .from('competitors')
    .insert({
      user_id: userId,
      url: normalizedUrl,
      name
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Remove competitor
export async function removeCompetitor(competitorId, userId) {
  const { error } = await supabase
    .from('competitors')
    .delete()
    .eq('id', competitorId)
    .eq('user_id', userId)

  if (error) throw error
}

// ============ REPORTS ============

// Fetch reports
export async function fetchReports(userId, limit = 10) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============ ACTIVITY LOG ============

// Fetch recent activity
export async function fetchActivity(userId, limit = 20) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Log activity
export async function logActivity(userId, agent, action, details = '') {
  const { error } = await supabase
    .from('activity_log')
    .insert({
      user_id: userId,
      agent,
      action,
      details
    })

  if (error) console.error('Failed to log activity:', error)
}

// ============ STATS ============

// Fetch dashboard stats
export async function fetchDashboardStats(userId) {
  const today = new Date().toISOString().split('T')[0]
  const todayStart = today + 'T00:00:00'

  // All leads
  const { data: allLeads } = await supabase
    .from('leads')
    .select('status, created_at')
    .eq('user_id', userId)
    .neq('status', 'archived')

  // Today's leads
  const { count: todayCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart)

  // Today's activity
  const { count: todayActivity } = await supabase
    .from('activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart)

  const leads = allLeads || []
  
  return {
    totalLeads: leads.length,
    newToday: todayCount || 0,
    contacted: leads.filter(l => l.status === 'contacted').length,
    replied: leads.filter(l => l.status === 'replied').length,
    meetings: leads.filter(l => l.status === 'meeting').length,
    tasksRunning: todayActivity || 0
  }
}
