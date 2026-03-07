import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST /api/push/send - send push notification to all subscribers
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message required' }, { status: 400 });
    }

    // Get all subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription');

    if (error) throw error;

    // In production, you would use web-push library to send notifications
    // For now, we'll just log and return success
    console.log(`Would send push notification: "${title}" - "${message}" to ${subscriptions?.length || 0} subscribers`);

    return NextResponse.json({ 
      success: true, 
      sent: subscriptions?.length || 0 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
