import { NextRequest, NextResponse } from 'next/server';
import { insertLead, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, service, budget, message } = body;

    // Validation
    if (!name || !email || !service || !message) {
      return NextResponse.json(
        { error: 'Name, email, service, and message are required' },
        { status: 400 }
      );
    }

    // Map service values to readable format
    const serviceMap: Record<string, string> = {
      'ai-automation': 'AI Automation Suite',
      'ai-agents': 'AI Agent Development',
      'consulting': 'Technical Consulting',
      'general': 'General Enquiry',
    };

    // Insert to leads table (reusing similar structure)
    const { data, error } = await insertLead({
      name,
      email,
      company: company || null,
      service_interest: serviceMap[service] || service,
      message: message,
      source: 'contact-form',
    });

    if (error) {
      console.error('Failed to insert contact:', error);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Log activity to agent_activity table
    if (isSupabaseConfigured()) {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('agent_activity').insert({
        agent_id: 'neo',
        agent_name: 'Neo',
        action_type: 'lead_captured',
        title: `New contact from ${name}`,
        description: `${company ? ` at ${company}` : ''} — interested in ${serviceMap[service] || service}`,
        status: 'new',
        metadata: { type: 'contact_form', email, budget },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
