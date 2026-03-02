const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hizmosyxhwgighzxvbrj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTA3MSwiZXhwIjoyMDg3NzYxMDcxfQ.z3bA-ijk11SFJzdw5dnjsHe9yU8_YF3seiuQfFSQ0gc';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
  return !error;
}

async function runMigration() {
  console.log('🚀 Running Phase 1 Migration...\n');

  // Check which tables exist
  const tables = ['organizations', 'organization_members', 'managed_agents', 'agent_tasks', 'workflows'];
  
  for (const table of tables) {
    const exists = await checkTable(table);
    console.log(`${exists ? '✓' : '✗'} ${table}: ${exists ? 'exists' : 'missing'}`);
  }

  // Try to create a test organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .upsert({
      clerk_org_id: 'test-org-1',
      name: 'PP Ventures',
      plan: 'starter'
    }, { onConflict: 'clerk_org_id' })
    .select()
    .single();

  if (orgError) {
    console.log('\n⚠️ Org error:', orgError.message);
  } else {
    console.log('\n✓ Test organization created/updated');
    console.log('  Org ID:', org.id);
    console.log('  Name:', org.name);
    console.log('  Plan:', org.plan);
  }

  // Try to create test agents
  if (org) {
    const agents = [
      {
        name: 'Sales Scout',
        role: 'Lead Researcher',
        specialty: 'Research prospects and find contact information',
        avatar: '🔍',
        color: '#14b8a6',
        status: 'active',
        system_prompt: 'You are Sales Scout, a lead research specialist.'
      },
      {
        name: 'Content Generator',
        role: 'Content Creator',
        specialty: 'Write blog posts, social media, newsletters',
        avatar: '✍️',
        color: '#8b5cf6',
        status: 'active',
        system_prompt: 'You are Content Generator, a creative writing specialist.'
      }
    ];

    for (const agent of agents) {
      const { error: agentError } = await supabase
        .from('managed_agents')
        .upsert({
          organization_id: org.id,
          ...agent
        }, { onConflict: 'organization_id,name' })
        .select()
        .single();

      if (!agentError) {
        console.log(`✓ Agent created: ${agent.name}`);
      }
    }
  }

  console.log('\n✅ Migration check complete!');
}

runMigration().catch(console.error);
