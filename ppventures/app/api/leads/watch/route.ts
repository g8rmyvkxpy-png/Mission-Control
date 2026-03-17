import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iglfjgsqqknionzmmprj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYyMjU2MiwiZXhwIjoyMDg4MTk4NTYyfQ.PnJsNMApnfKxGNE_bIiWapEpinVp1xkIXlORGV7pf7A';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const since = request.nextUrl.searchParams.get('since');
    
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (since) {
      query = query.gte('created_at', since);
    }
    
    const { data: leads, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Categorize leads based on service interest
    const categorized = leads?.map(lead => {
      let category = 'Other';
      if (lead.service_interest?.includes('consulting')) category = 'Consulting';
      else if (lead.service_interest?.includes('ai-agents')) category = 'SaaS';
      else if (lead.service_interest?.includes('venture')) category = 'Partner';
      
      return {
        ...lead,
        category,
        needsReview: lead.status === 'new'
      };
    }) || [];
    
    return NextResponse.json({ leads: categorized });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
