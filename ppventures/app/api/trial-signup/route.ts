import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sendWelcomeEmail, sendInternalNotification } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, business } = body;

    // Validation
    if (!name || !email || !business) {
      return NextResponse.json(
        { error: 'Name, email, and business are required' },
        { status: 400 }
      );
    }

    // If Supabase is configured, insert client
    if (isSupabaseConfigured()) {
      const { supabase } = await import('@/lib/supabase');
      
      // Insert client
      await supabase.from('clients').insert({
        name,
        email,
        business_name: business,
        status: 'trial',
        tier: 'starter',
      });

      // Log activity
      await supabase.from('agent_activity').insert({
        agent_id: 'neo',
        agent_name: 'Neo',
        action_type: 'lead_captured',
        title: `New trial signup: ${business}`,
        description: `Onboard ${name}`,
        status: 'new',
        metadata: { type: 'trial-signup', email },
      });
    }

    // Also register client in the client dashboard's database
    try {
      const registerRes = await fetch('http://72.62.231.18:3004/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          business_name: business,
          niche: '',
          target_audience: '',
          tier: 'starter'
        })
      });
      if (registerRes.ok) {
        console.log('Client registered in dashboard DB');
      }
    } catch (dbError: any) {
      console.error('Failed to register in dashboard DB:', dbError.message);
    }

    // Send welcome email to the user
    if (process.env.RESEND_API_KEY) {
      try {
        await sendWelcomeEmail({ name, email, businessName: business });
        console.log('Welcome email sent to:', email);
      } catch (emailError: any) {
        console.error('Failed to send welcome email:', emailError.message);
      }

      // Send internal notification
      try {
        await sendInternalNotification({ name, email, businessName: business });
        console.log('Internal notification sent');
      } catch (notifyError: any) {
        console.error('Failed to send internal notification:', notifyError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Trial signup successful',
    });
  } catch (error) {
    console.error('Trial signup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
