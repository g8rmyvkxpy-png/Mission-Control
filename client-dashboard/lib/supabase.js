import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iglfjgsqqknionzmmprj.supabase.co')
  : 'https://iglfjgsqqknionzmmprj.supabase.co'

const supabaseAnonKey = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjI1NjIsImV4cCI6MjA4ODE5ODU2Mn0.y6rfeWhG-ExBCiQarPXgvLqaDv6NBaA4MB9FbSbB_3w')
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjI1NjIsImV4cCI6MjA4ODE5ODU2Mn0.y6rfeWhG-ExBCiQarPXgvLqaDv6NBaA4MB9FbSbB_3w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function isSupabaseConfigured() {
  return supabaseUrl !== '' && supabaseAnonKey !== ''
}
