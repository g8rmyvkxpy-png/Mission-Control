const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hizmosyxhwgighzxvbrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpem1vc3l4aHdnaWdoenh2YnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTA3MSwiZXhwIjoyMDg3NzYxMDcxfQ.z3bA-ijk11SFJzdw5dnjsHe9yU8_YF3seiuQfFSQ0gc'
);

const orgId = '56b94071-3455-4967-9300-60788486a4fb';

// Website improvement tasks
const tasks = [
  { title: 'Convert ppventures HTML to Next.js', description: 'Build proper Next.js version of ppventures.tech', status: 'pending', priority: 'high' },
  { title: 'Add blog RSS feed', description: 'Generate RSS feed for blog posts', status: 'pending', priority: 'medium' },
  { title: 'SEO optimization', description: 'Improve SEO meta tags, sitemap, robots.txt', status: 'pending', priority: 'medium' },
  { title: 'Add contact form', description: 'Create working contact form with email', status: 'pending', priority: 'high' },
  { title: 'Mobile responsiveness check', description: 'Ensure all pages work on mobile', status: 'pending', priority: 'medium' },
  { title: 'Add dark mode toggle', description: 'Implement dark/light theme switcher', status: 'pending', priority: 'low' },
  { title: 'Performance optimization', description: 'Improve page load times', status: 'pending', priority: 'medium' },
  { title: 'Add analytics tracking', description: 'Set up visitor analytics', status: 'pending', priority: 'low' },
];

async function addTasks() {
  console.log('Adding website improvement tasks...\n');
  
  for (const task of tasks) {
    try {
      const { data, error } = await supabase
        .from('agent_tasks')
        .insert({ organization_id: orgId, ...task })
        .select();
      
      if (error) {
        console.log(`❌ ${task.title}: ${error.message}`);
      } else {
        console.log(`✅ ${task.title}`);
      }
    } catch (err) {
      console.log(`❌ ${task.title}: ${err.message}`);
    }
  }
  
  console.log('\nDone!');
}

addTasks();
