import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;

// POST /api/goals/generate-tasks - Trigger agents to generate tasks from goals
export async function POST(request) {
  try {
    // Fetch all active goals
    const { data: goals, error: goalsError } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: false });
    
    if (goalsError) {
      return NextResponse.json({ error: goalsError.message }, { status: 500 });
    }
    
    if (!goals || goals.length === 0) {
      return NextResponse.json({ message: 'No active goals found', tasksGenerated: 0 });
    }
    
    // Fetch all agents
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from('agents')
      .select('*');
    
    if (agentsError) {
      return NextResponse.json({ error: agentsError.message }, { status: 500 });
    }
    
    const generatedTasks = [];
    
    // For each agent, generate tasks
    for (const agent of agents) {
      const goalsList = goals.map((g, i) => `${i + 1}. ${g.title} - ${g.description || ''}`).join('\n');
      
      const agentContext = agent.name === 'Atlas' 
        ? 'You are the RESEARCH agent - focus on web research, finding information, and creating reports.'
        : agent.name === 'Orbit'
        ? 'You are the OPERATIONS agent - focus on monitoring, summaries, and operational tasks.'
        : 'You are the LEAD agent - focus on coordination, complex reasoning, and general tasks.';
      
      const prompt = `You are ${agent.name}, an autonomous AI agent in a Command Centre.
${agentContext}

Your Command Centre setup:
- Running at http://72.62.231.18:3001
- You have Tavily web search for real-time research
- All work saved to Supabase
- Owner sees results in Task Board, Memory, Docs

Here are the user's current goals:
${goalsList}

Generate 2 SPECIFIC tasks you can complete TODAY using Tavily web search.
Each task must:
1. Include the exact search query to use
2. Have a clear deliverable (doc, summary, list, comparison table)
3. Be directly related to one of the goals above
4. Be completable in under 30 minutes

Bad: "Research market trends"
Good: "Use Tavily to search 'AI agent market trends 2026' and write a 300-word summary of top 5 trends, save as doc"

Respond ONLY in JSON (no other text):
[
  {"title": "specific task title with action", "description": "Exact search query and what to deliver", "goal": "which goal this helps", "reasoning": "why this matters"},
  {"title": "specific task title with action", "description": "Exact search query and what to deliver", "goal": "which goal this helps", "reasoning": "why this matters"}
]`;
      
      const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'You are a helpful AI that responds in JSON only.' },
            { role: 'user', content: prompt }
          ],
          group_id: MINIMAX_GROUP_ID
        })
      });
      
      if (!response.ok) {
        console.error(`Failed to generate tasks for ${agent.name}:`, response.status);
        continue;
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON
      let tasks = [];
      try {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tasks = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        console.error('Failed to parse JSON:', parseErr);
      }
      
      // Create tasks in database
      for (const taskData of tasks) {
        // Find matching goal
        const matchingGoal = goals.find(g => g.title.toLowerCase().includes(taskData.goal?.toLowerCase() || '')) || goals[0];
        
        // Create task
        const { data: task, error: taskError } = await supabaseAdmin
          .from('tasks')
          .insert({
            title: taskData.title,
            description: taskData.description,
            assigned_to: agent.id,
            created_by: 'goal_generation',
            priority: 'medium',
            status: 'backlog'
          })
          .select()
          .single();
        
        if (taskError) {
          console.error('Failed to create task:', taskError);
          continue;
        }
        
        // Track generated task
        await supabaseAdmin
          .from('agent_generated_tasks')
          .insert({
            goal_id: matchingGoal?.id,
            task_id: task.id,
            generated_date: new Date().toISOString().split('T')[0],
            reasoning: taskData.reasoning
          });
        
        // Log to activity
        await supabaseAdmin
          .from('activity_logs')
          .insert({
            agent_id: agent.id,
            message: `Generated task from goal: ${matchingGoal?.title || 'General'}`,
            log_type: 'task'
          });
        
        generatedTasks.push(task);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      tasksGenerated: generatedTasks.length,
      tasks: generatedTasks
    });
    
  } catch (err) {
    console.error('Generate tasks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
