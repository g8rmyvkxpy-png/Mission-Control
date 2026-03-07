import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder';
}

// ===========================================
// DATA ISOLATION GUARANTEE
// ===========================================
// The following tables are for SaaS metrics ONLY:
// - leads (website contact forms)
// - agent_activity (agent task logs)
// - venture_revenue (SaaS revenue - NO personal assets)
// - saas_metrics (aggregated metrics)
//
// PERSONAL ASSET DATA (Real Estate, Crypto, Stocks, Bank)
// is stored SEPARATELY and is NOT accessible via this client.
// ===========================================

// Types - SaaS only
export interface Lead {
  id?: string;
  name: string;
  email: string;
  company?: string;
  service_interest?: string;
  message?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  created_at?: string;
}

export interface AgentActivity {
  id?: string;
  agent_id: string;
  agent_name: string;
  action_type: 'task_created' | 'task_completed' | 'task_failed' | 'message_sent' | 'lead_captured';
  title?: string;
  description?: string;
  status?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface VentureRevenue {
  id?: string;
  transaction_id?: string;
  plan_type: 'Basic' | 'Pro' | 'Ultra' | 'Enterprise';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  revenue_amount: number;
  currency?: string;
  customer_email?: string;
  customer_name?: string;
  created_at?: string;
}

export interface SaaSMetrics {
  id?: string;
  metric_date: string;
  mrr: number;
  active_customers: number;
  churn_rate: number;
  active_agents: number;
  new_signups: number;
  created_at?: string;
}

// Database Operations - SaaS ONLY

// Lead operations
export async function insertLead(lead: Omit<Lead, 'id' | 'created_at' | 'status'>) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return { data: null, error: 'Supabase not configured' };
  }
  return await supabase.from('leads').insert(lead).select();
}

export async function getLeads() {
  if (!isSupabaseConfigured()) return { data: [], error: 'Supabase not configured' };
  return await supabase.from('leads').select('*').order('created_at', { ascending: false });
}

// Agent activity operations
export async function insertAgentActivity(activity: Omit<AgentActivity, 'id' | 'created_at'>) {
  if (!isSupabaseConfigured()) return { data: null, error: 'Supabase not configured' };
  return await supabase.from('agent_activity').insert(activity).select();
}

export async function getAgentHistory(agentId: string) {
  if (!isSupabaseConfigured()) return { data: [], error: 'Supabase not configured' };
  return await supabase.from('agent_activity').select('*').eq('agent_id', agentId).order('created_at', { ascending: false }).limit(10);
}

// SaaS Revenue operations
export async function insertRevenue(revenue: Omit<VentureRevenue, 'id' | 'created_at'>) {
  if (!isSupabaseConfigured()) return { data: null, error: 'Supabase not configured' };
  return await supabase.from('venture_revenue').insert(revenue).select();
}

export async function getRevenue() {
  if (!isSupabaseConfigured()) return { data: [], error: 'Supabase not configured' };
  return await supabase.from('venture_revenue').select('*').order('created_at', { ascending: false });
}

// SaaS Metrics operations
export async function insertMetrics(metrics: Omit<SaaSMetrics, 'id' | 'created_at'>) {
  if (!isSupabaseConfigured()) return { data: null, error: 'Supabase not configured' };
  return await supabase.from('saas_metrics').insert(metrics).select();
}

export async function getMetrics() {
  if (!isSupabaseConfigured()) return { data: [], error: 'Supabase not configured' };
  return await supabase.from('saas_metrics').select('*').order('metric_date', { ascending: false });
}

// ===========================================
// PERSONAL ASSETS ARE NOT INCLUDED
// Personal wealth data (Real Estate, Crypto, Stocks, Bank accounts)
// is stored in a SEPARATE, ISOLATED table with stricter RLS.
// This client cannot access that data.
// ===========================================
