import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, clientId } = await request.json();
    
    if (!query || !clientId) {
      return NextResponse.json({ error: 'Query and clientId required' }, { status: 400 });
    }
    
    // Try RAG API first
    try {
      const res = await fetch('http://72.62.231.18:3006/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, client_id: clientId })
      });
      
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.log('RAG API not available, using fallback');
    }
    
    // Fallback response
    return NextResponse.json({ 
      answer: "I don't have enough data yet. Your agents are working to gather information. Check back in a few minutes!",
      sources: []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
