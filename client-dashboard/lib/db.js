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
      name: 'Sarah Johnson',
      email: 'sarah@techstartup.io',
      company: 'TechStartup IO',
      lead_score: 8,
      source: 'sample',
      status: 'new',
      notes: `Sample lead in ${targetNiche} - Neo will find real leads soon.`
    },
    {
      user_id: userId,
      name: 'Mike Chen',
      email: 'mike@growthagency.co',
      company: 'Growth Agency Co',
      lead_score: 7,
      source: 'sample',
      status: 'new',
      notes: `Sample lead in ${targetNiche} - Neo will find real leads soon.`
    },
    {
      user_id: userId,
      name: 'Lisa Wang',
      email: 'lisa@enterprise.com',
      company: 'Enterprise Solutions',
      lead_score: 9,
      source: 'sample',
      status: 'new',
      notes: `Sample lead in ${targetNiche} - Neo will find real leads soon.`
    }
  ]

  const { error } = await supabase.from('leads').insert(sampleLeads)
  if (error) console.error('Seed error:', error.message)
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
