import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// VAPID keys - generate your own for production
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// POST /api/push/subscribe - save subscription
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json({ error: 'subscription required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .insert({ subscription })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, subscription: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/push - get VAPID public key for frontend
export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
}
