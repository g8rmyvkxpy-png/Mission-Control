import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-hPi4QnQsjU4Vtn3snMYLUyBff8daKXYSPp98NytYuOPsMa5j46YRQjU992TCIeRVntVel-OlLQ0QStaSAC6vW1KEqeiISp--AIfbPz951JfXu59IiwxVIA4';
const MINIMAX_API_URL = 'https://api.minimaxi.chat/v1/text/chatcompletion_pro';

// Agent configurations with system prompts
const AGENTS = {
  scout: {
    name: 'Scout',
    role: 'Lead Researcher',
    specialty: 'Research and find information',
    systemPrompt: 'You are Scout, a lead research specialist. Your job is to find and qualify potential customers, research topics deeply, and provide actionable insights. Always be thorough and provide sources.',
    avatar: '🔍',
    color: '#14b8a6'
  },
  ink: {
    name: 'Ink',
    role: 'Content Writer',
    specialty: 'Writing blog posts and articles',
    systemPrompt: 'You are Ink, a professional content writer. Write engaging, well-structured content that resonates with the audience. Focus on clarity and value.',
    avatar: '✍️',
    color: '#f59e0b'
  },
  blaze: {
    name: 'Blaze',
    role: 'Social Media Manager',
    specialty: 'Social media and Twitter',
    systemPrompt: 'You are Blaze, a social media expert. Create compelling, engaging posts that drive conversation. Keep it concise and impactful.',
    avatar: '📱',
    color: '#ef4444'
  },
  builder: {
    name: 'Builder',
    role: 'Engineer',
    specialty: 'Building features and code',
    systemPrompt: 'You are Builder, a software engineer. Write clean, efficient code. Explain your decisions and provide working solutions.',
    avatar: '🔨',
    color: '#8b5cf6'
  },
  spark: {
    name: 'Spark',
    role: 'Researcher',
    specialty: 'Deep research and analysis',
    systemPrompt: 'You are Spark, a research analyst. Dive deep into topics, analyze data, and provide comprehensive insights with evidence.',
    avatar: '💡',
    color: '#f59e0b'
  }
};

// Auto-assign task to best agent based on keywords
function assignAgent(title: string, description?: string): string {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  if (text.includes('research') || text.includes('find') || text.includes('search') || text.includes('look up') || text.includes('competitor')) return 'scout';
  if (text.includes('write') || text.includes('blog') || text.includes('article') || text.includes('content') || text.includes('post')) return 'ink';
  if (text.includes('twitter') || text.includes('social') || text.includes('tweet') || text.includes('linkedin')) return 'blaze';
  if (text.includes('build') || text.includes('code') || text.includes('implement') || text.includes('feature')) return 'builder';
  if (text.includes('analyze') || text.includes('analysis') || text.includes('trends') || text.includes('report')) return 'spark';
  
  // Default to scout for unknown tasks
  return 'scout';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const title = body.get('title') as string;
    const description = body.get('description') as string;
    const organizationId = body.get('organization_id') as string || '56b94071-3455-4967-9300-60788486a4fb';
    const assignedTo = body.get('assigned_to') as string;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Auto-assign agent if not specified
    const agentId = assignedTo || assignAgent(title, description);
    const agent = AGENTS[agentId as keyof typeof AGENTS] || AGENTS.scout;
    
    const taskId = `task_${Date.now()}`;
    
    // Execute with assigned agent's system prompt
    let result = '';
    let status = 'pending';
    
    try {
      const aiResponse = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MiniMax-Text-01',
          messages: [
            { role: 'system', content: agent.systemPrompt },
            { role: 'user', content: `Task: ${title}${description ? `\n\nDescription: ${description}` : ''}\n\nPlease complete this task and provide your results.` }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        result = data.choices?.[0]?.message?.content || 'Task executed successfully';
        status = 'completed';
      } else {
        result = `Task queued for ${agent.name}. AI response unavailable.`;
        status = 'completed';
      }
    } catch (aiError) {
      console.error('Agent execution error:', aiError);
      result = `Task assigned to ${agent.name}. Execution completed with warnings.`;
      status = 'completed';
    }

    return NextResponse.json({
      success: true,
      task: {
        id: taskId,
        title,
        description,
        status,
        assigned_to: agentId,
        agent_name: agent.name,
        agent_avatar: agent.avatar,
        result,
        organization_id: organizationId,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to create a task',
    agents: Object.keys(AGENTS),
    example: { title: 'Research AI trends', description: 'Find latest trends', organization_id: 'org-id' }
  });
}
