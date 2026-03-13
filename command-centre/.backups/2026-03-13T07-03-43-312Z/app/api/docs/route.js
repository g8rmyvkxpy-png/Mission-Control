import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

console.log('log test');
console.log('wrapped test');
console.log('final test');

// Helper to count words
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

// GET /api/docs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const format = searchParams.get('format');
    
    let query = supabaseAdmin
      .from('documents')
      .select('*, agent:agents(name, avatar_color)')
      .order('created_at', { ascending: false });
    
    if (category) query = query.eq('category', category);
    if (format) query = query.eq('format', format);
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    let docs = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      docs = docs.filter(d => 
        d.title?.toLowerCase().includes(searchLower) ||
        d.content?.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({ docs });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/docs
export async function POST(request) {
  try {
    const { title, content, format, category, agent_id, tags } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }
    
    const wordCount = countWords(content);
    
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        title,
        content,
        format: format || 'markdown',
        category: category || 'general',
        agent_id: agent_id || null,
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

// PATCH /api/docs
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    const { title, content, format, category, tags } = body;
    
    const updateData = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      updateData.word_count = countWords(content);
    }
    if (format !== undefined) updateData.format = format;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update(updateData)
      .eq('id', id)
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

// DELETE /api/docs
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
