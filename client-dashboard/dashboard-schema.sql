-- PPVentures Dashboard - Phase 1 Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  business_name TEXT,
  target_niche TEXT,
  industry_keywords TEXT,
  outreach_tone TEXT DEFAULT 'professional',
  outreach_length TEXT DEFAULT 'medium',
  outreach_signoff TEXT,
  neo_schedule TEXT DEFAULT '07:00',
  atlas_schedule TEXT DEFAULT '06:00',
  orbit_schedule TEXT DEFAULT '18:00',
  email_daily_reports BOOLEAN DEFAULT true,
  email_competitor_alerts BOOLEAN DEFAULT true,
  email_news_digest BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'suite',
  trial_starts_at TIMESTAMP DEFAULT now(),
  trial_ends_at TIMESTAMP DEFAULT (now() + interval '14 days'),
  subscription_active BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- LEADS TABLE (Neo's output)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT NOT NULL,
  company_url TEXT,
  linkedin_url TEXT,
  location TEXT,
  lead_score INTEGER CHECK (lead_score BETWEEN 1 AND 10),
  score_reasoning TEXT,
  source_url TEXT,
  outreach_draft TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','replied','meeting','archived')),
  notes TEXT,
  scraped_by TEXT DEFAULT 'neo',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- COMPETITORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  name TEXT,
  last_snapshot TEXT,
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- COMPETITOR CHECKS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS competitor_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  checked_at TIMESTAMP DEFAULT now(),
  changes_detected BOOLEAN DEFAULT false,
  change_summary TEXT,
  snapshot TEXT
);

-- ============================================
-- NEWS DIGESTS
-- ============================================
CREATE TABLE IF NOT EXISTS news_digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  articles JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- DAILY REPORTS (Orbit's output)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  report_content TEXT NOT NULL,
  stats JSONB,
  generated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- AGENT ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  agent TEXT NOT NULL CHECK (agent IN ('neo','atlas','orbit','system')),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- CHAT MESSAGES (Ask AI)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- DOCUMENTS (for RAG - Phase 4)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads (user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON leads (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_competitors_user ON competitors (user_id);
CREATE INDEX IF NOT EXISTS idx_news_user_date ON news_digests (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_messages (user_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see their own data
DROP POLICY IF EXISTS "Users see own data" ON users;
CREATE POLICY "Users see own data" ON users FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS "Users see own leads" ON leads;
CREATE POLICY "Users see own leads" ON leads FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own competitors" ON competitors;
CREATE POLICY "Users see own competitors" ON competitors FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own checks" ON competitor_checks;
CREATE POLICY "Users see own checks" ON competitor_checks FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own news" ON news_digests;
CREATE POLICY "Users see own news" ON news_digests FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own reports" ON reports;
CREATE POLICY "Users see own reports" ON reports FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own activity" ON activity_log;
CREATE POLICY "Users see own activity" ON activity_log FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own chat" ON chat_messages;
CREATE POLICY "Users see own chat" ON chat_messages FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own docs" ON documents;
CREATE POLICY "Users see own docs" ON documents FOR ALL USING (user_id = auth.uid());

-- Enable auth for magic links
-- (Supabase Auth is enabled by default)

SELECT 'Database schema created successfully!' as status;
