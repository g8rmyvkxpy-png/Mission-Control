const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hizmosyxhwgighzxvbrj.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTA3MSwiZXhwIjoyMDg3NzYxMDcxfQ.z3bA-ijk11SFJzdw5dnjsHe9yU8_YF3seiuQfFSQ0gc';

const supabase = createClient(supabaseUrl, serviceKey);

async function addMoreData() {
  console.log('Adding more sample data...\n');

  // Get org ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', 'test-org-1')
    .single();

  if (!org) {
    console.log('No organization found');
    return;
  }

  const orgId = org.id;
  console.log('Org ID:', orgId);

  // Add more agents
  const agents = [
    { name: 'Content Writer', role: 'Content Creator', specialty: 'Write blog posts and articles', avatar: '✍️', color: '#8b5cf6', status: 'active', system_prompt: 'You are a content writer.' },
    { name: 'Market Analyst', role: 'Researcher', specialty: 'Analyze market trends and competitors', avatar: '📊', color: '#ec4899', status: 'active', system_prompt: 'You are a market analyst.' },
    { name: 'Support Bot', role: 'Customer Support', specialty: 'Answer customer questions', avatar: '🎧', color: '#06b6d4', status: 'inactive', system_prompt: 'You are a support agent.' },
  ];

  for (const agent of agents) {
    await supabase
      .from('managed_agents')
      .upsert({ organization_id: orgId, ...agent }, { onConflict: 'organization_id,name' });
    console.log('✓ Added agent:', agent.name);
  }

  // Add tasks
  const tasks = [
    { title: 'Research AI trends for 2026', description: 'Find latest AI developments', status: 'completed', priority: 'high' },
    { title: 'Write blog post about automation', description: 'Draft a 1000-word article', status: 'processing', priority: 'medium' },
    { title: 'Follow up with leads', description: 'Contact 10 potential customers', status: 'pending', priority: 'high' },
    { title: 'Update website copy', description: 'Refresh homepage content', status: 'pending', priority: 'low' },
  ];

  for (const task of tasks) {
    const { data } = await supabase
      .from('agent_tasks')
      .insert({ organization_id: orgId, ...task })
      .select()
      .single();
    console.log('✓ Added task:', task.title);
  }

  console.log('\n✅ Sample data added!');
}

addMoreData().catch(console.error);
