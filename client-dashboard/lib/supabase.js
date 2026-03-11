import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hizmosyxhwgighzxvbrj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODUwNzEsImV4cCI6MjA4Nzc2MTA3MX0.nPlxv-9SIMTIdHq-FFqC1j_9l0ba2KDSax_l7NKpmt8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== '' && supabaseAnonKey !== ''
}
