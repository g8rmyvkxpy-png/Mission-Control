export async function POST(request) {
  try {
    const { systemPrompt, userMessage, model, apiKey } = await request.json();
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 400 });
    }
    
    const response = await fetch('https://api.minimax.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return Response.json({ error: data.error?.message || 'API error', code: data.error?.code }, { status: response.status });
    }
    
    return Response.json({ 
      result: data.choices?.[0]?.message?.content || 'No response',
      usage: data.usage 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
