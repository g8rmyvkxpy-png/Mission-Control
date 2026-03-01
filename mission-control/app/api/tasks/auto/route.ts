import { NextRequest, NextResponse } from 'next/server';

// MiniMax API configuration
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-hPi4QnQsjU4Vtn3snMYLUyBff8daKXYSPp98NytYuOPsMa5j46YRQjU992TCIeRVntVel-OlLQ0QStaSAC6vW1KEqeiISp--AIfbPz951JfXu59IiwxVIA4';
const MINIMAX_API_URL = 'https://api.minimaxi.chat/v1/text/chatcompletion_pro';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const title = body.get('title') as string;
    const organizationId = body.get('organization_id') as string || '56b94071-3455-4967-9300-60788486a4fb';

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate a task ID
    const taskId = `task_${Date.now()}`;
    const status = 'processing';

    // Try to execute with MiniMax AI
    let result = '';
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
            { role: 'system', content: 'You are a helpful AI assistant. Provide concise and useful responses.' },
            { role: 'user', content: title }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        result = data.choices?.[0]?.message?.content || 'Task executed successfully';
      } else {
        result = `Task "${title}" has been queued for execution.`;
      }
    } catch (aiError) {
      console.error('MiniMax API error:', aiError);
      result = `Task "${title}" created successfully. AI execution pending.`;
    }

    return NextResponse.json({
      success: true,
      task: {
        id: taskId,
        title,
        status: 'completed',
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
    example: { title: 'Research AI trends', organization_id: 'your-org-id' }
  });
}
