import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if already subscribed
    if (isSupabaseConfigured()) {
      const { data: existing } = await supabase
        .from('leads')
        .select('email')
        .eq('email', email)
        .eq('source', 'newsletter')
        .maybeSingle();
      
      if (existing) {
        return NextResponse.json({ success: true, message: 'Already subscribed!' });
      }
      
      // Insert new subscriber
      const { error } = await supabase.from('leads').insert({
        name: 'Newsletter Subscriber',
        email,
        company: null,
        service_interest: 'Newsletter',
        message: 'Signed up via newsletter form',
        source: 'newsletter',
      });

      if (error) {
        console.error('Subscribe error:', error);
        // Still return success to avoid revealing internal errors
      }
    } else {
      console.log('Newsletter subscription (no Supabase):', email);
    }
    
    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
