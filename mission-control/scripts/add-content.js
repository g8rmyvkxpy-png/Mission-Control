const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hizmosyxhwgighzxvbrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTA3MSwiZXhwIjoyMDg3NzYxMDcxfQ.z3bA-ijk11SFJzdw5dnjsHe9yU8_YF3seiuQfFSQ0gc'
);

const orgId = '56b94071-3455-4967-9300-60788486a4fb';

// Content items for PP Ventures blog
const contentItems = [
  {
    title: 'How AI Agents Are Replacing Traditional SaaS',
    description: 'Analysis of AI agent trends in 2026 - why autonomous agents are the next big thing',
    stage: 'idea',
    platform: 'linkedin',
    content: ''
  },
  {
    title: 'Building Your First AI Agent: A Step-by-Step Guide',
    description: 'Complete tutorial for developers looking to build their first AI agent',
    stage: 'drafting',
    platform: 'blog',
    content: '# Building Your First AI Agent\n\nStep-by-step guide...'
  },
  {
    title: 'The ROI of AI Agents: Real Numbers from 2026',
    description: 'Case study with metrics showing real return on investment',
    stage: 'review',
    platform: 'linkedin',
    content: ''
  },
  {
    title: 'Small Business Automation with AI Agents',
    description: 'Practical guide for small businesses to automate with AI',
    stage: 'scheduled',
    platform: 'blog',
    scheduledAt: '2026-03-10',
    content: ''
  },
  {
    title: 'Autonomous Companies: The Future of Work',
    description: 'Vision piece about the future of fully autonomous companies',
    stage: 'idea',
    platform: 'blog',
    content: ''
  }
];

async function addContent() {
  console.log('Adding content to pipeline...\n');
  
  for (const item of contentItems) {
    try {
      const { data, error } = await supabase
        .from('content')
        .insert({ organization_id: orgId, ...item })
        .select();
      
      if (error) {
        console.log(`❌ ${item.title}: ${error.message}`);
      } else {
        console.log(`✅ ${item.title} (${item.stage})`);
      }
    } catch (err) {
      console.log(`❌ ${item.title}: ${err.message}`);
    }
  }
  
  console.log('\nDone!');
}

addContent();
