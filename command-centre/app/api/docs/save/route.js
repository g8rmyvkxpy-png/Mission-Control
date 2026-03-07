import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

// POST /api/docs/save - agent saves a document
export async function POST(request) {
  try {
    const { api_key, title, content, format, category, tags } = await request.json();
    
    if (!api_key || !title || !content) {
      return NextResponse.json({ error: 'API key, title, and content required' }, { status: 400 });
    }
    
    // Find agent
    const { data: agent, error: findError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('api_key', api_key)
      .single();
    
    if (findError || !agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // Auto-detect category from title if not provided
    let detectedCategory = category || 'general';
    const titleLower = title.toLowerCase();
    if (titleLower.includes('newsletter')) detectedCategory = 'newsletter';
    else if (titleLower.includes('research')) detectedCategory = 'research';
    else if (titleLower.includes('plan')) detectedCategory = 'plan';
    else if (titleLower.includes('script')) detectedCategory = 'script';
    else if (titleLower.includes('report')) detectedCategory = 'report';
    
    const wordCount = countWords(content);
    
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        title,
        content,
        format: format || 'markdown',
        category: detectedCategory,
        agent_id: agent.id,
        tags: tags || null,
        word_count: wordCount
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, document: data });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
