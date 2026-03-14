import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/revenue - Get revenue dashboard data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'summary', 'entries', 'pipeline', 'milestones'
    
    // Get summary stats
    if (type === 'summary' || !type) {
      // Total confirmed revenue
      const { data: revenue } = await supabaseAdmin
        .from('revenue_entries')
        .select('amount, recurring, frequency')
        .eq('status', 'confirmed');
      
      const totalRevenue = revenue?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      // Monthly recurring revenue (MRR)
      const mrr = revenue?.reduce((sum, r) => {
        if (r.recurring) {
          if (r.frequency === 'monthly') return sum + Number(r.amount);
          if (r.frequency === 'quarterly') return sum + Number(r.amount) / 3;
          if (r.frequency === 'yearly') return sum + Number(r.amount) / 12;
        }
        return sum;
      }, 0) || 0;
      
      // Pipeline value
      const { data: pipeline } = await supabaseAdmin
        .from('pipeline')
        .select('value, probability, stage')
        .in('stage', ['lead', 'qualified', 'proposal', 'negotiation']);
      
      const pipelineValue = pipeline?.reduce((sum, p) => sum + (Number(p.value) || 0), 0) || 0;
      const weightedPipeline = pipeline?.reduce((sum, p) => {
        return sum + (Number(p.value) || 0) * (Number(p.probability) || 0) / 100;
      }, 0) || 0;
      
      // Counts
      const { count: totalEntries } = await supabaseAdmin
        .from('revenue_entries')
        .select('*', { count: 'exact', head: true });
      
      const { count: activePipeline } = await supabaseAdmin
        .from('pipeline')
        .select('*', { count: 'exact', head: true })
        .in('stage', ['lead', 'qualified', 'proposal', 'negotiation']);
      
      // Milestones progress
      const { data: milestones } = await supabaseAdmin
        .from('milestones')
        .select('*')
        .order('target_amount', { ascending: true });
      
      return NextResponse.json({
        summary: {
          totalRevenue,
          mrr: Math.round(mrr * 100) / 100,
          pipelineValue,
          weightedPipeline: Math.round(weightedPipeline * 100) / 100,
          totalEntries: totalEntries || 0,
          activePipeline: activePipeline || 0,
          goal: 1000000,
          progress: ((totalRevenue / 1000000) * 100).toFixed(2)
        },
        milestones: milestones || []
      });
    }
    
    // Get revenue entries
    if (type === 'entries') {
      const { data } = await supabaseAdmin
        .from('revenue_entries')
        .select('*')
        .order('received_date', { ascending: false })
        .limit(50);
      return NextResponse.json({ entries: data || [] });
    }
    
    // Get pipeline
    if (type === 'pipeline') {
      const { data } = await supabaseAdmin
        .from('pipeline')
        .select('*')
        .order('created_at', { ascending: false });
      return NextResponse.json({ pipeline: data || [] });
    }
    
    // Get milestones
    if (type === 'milestones') {
      const { data } = await supabaseAdmin
        .from('milestones')
        .select('*')
        .order('target_amount', { ascending: true });
      return NextResponse.json({ milestones: data || [] });
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Revenue API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/revenue - Add revenue entry or pipeline item
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...data } = body; // type: 'entry' or 'pipeline'
    
    if (type === 'entry') {
      const { amount, source, customer_name, customer_email, description, status, recurring, frequency, received_date } = data;
      
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
      }
      
      const { data: entry, error } = await supabaseAdmin
        .from('revenue_entries')
        .insert({
          amount,
          source: source || 'other',
          customer_name,
          customer_email,
          description,
          status: status || 'confirmed',
          recurring: recurring || false,
          frequency: frequency || 'one_time',
          received_date: received_date || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Check and update milestones
      const { data: allRevenue } = await supabaseAdmin
        .from('revenue_entries')
        .select('amount')
        .eq('status', 'confirmed');
      
      const total = allRevenue?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      await supabaseAdmin
        .from('milestones')
        .update({ 
          current_amount: total,
          reached: true,
          reached_date: new Date().toISOString().split('T')[0]
        })
        .lte('target_amount', total)
        .eq('reached', false);
      
      return NextResponse.json({ success: true, entry });
    }
    
    if (type === 'pipeline') {
      const { company_name, contact_name, contact_email, contact_phone, source, stage, value, probability, expected_close_date, notes, assigned_to } = data;
      
      if (!company_name) {
        return NextResponse.json({ error: 'Company name required' }, { status: 400 });
      }
      
      const { data: item, error } = await supabaseAdmin
        .from('pipeline')
        .insert({
          company_name,
          contact_name,
          contact_email,
          contact_phone,
          source: source || 'other',
          stage: stage || 'lead',
          value: value || 0,
          probability: probability || 10,
          expected_close_date,
          notes,
          assigned_to
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ success: true, item });
    }
    
    return NextResponse.json({ error: 'Invalid type. Use: entry, pipeline' }, { status: 400 });
  } catch (err) {
    console.error('Revenue POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/revenue - Update revenue entry or pipeline item
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, type, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    if (type === 'entry') {
      const { data: entry, error } = await supabaseAdmin
        .from('revenue_entries')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, entry });
    }
    
    if (type === 'pipeline') {
      const updateData = { ...data, updated_at: new Date().toISOString() };
      
      // Handle stage changes
      if (data.stage === 'closed_won' || data.stage === 'closed_lost') {
        updateData.closed_at = new Date().toISOString();
      }
      
      const { data: item, error } = await supabaseAdmin
        .from('pipeline')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, item });
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Revenue PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/revenue - Delete revenue entry or pipeline item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    
    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type required' }, { status: 400 });
    }
    
    const table = type === 'entry' ? 'revenue_entries' : 'pipeline';
    const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Revenue DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
