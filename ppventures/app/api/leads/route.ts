import { NextRequest, NextResponse } from 'next/server';
import { insertLead, getLeads, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, service_interest, message } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Insert lead to Supabase
    const { data, error } = await insertLead({
      name,
      email,
      company: company || null,
      service_interest: service_interest || null,
      message: message || null,
      source: 'website',
    });

    if (error) {
      console.error('Failed to insert lead:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: data?.[0]?.id,
    });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Only allow authenticated users to fetch leads
  // In production, add Clerk/NextAuth check here
  
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  const { data, error } = await getLeads();

  if (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }

  return NextResponse.json({ leads: data || [] });
}
