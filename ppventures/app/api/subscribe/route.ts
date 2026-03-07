import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // In production, insert to Supabase:
    // await supabase.from('subscribers').insert({ email });
    
    // For now, simulate success
    console.log('New subscriber:', email);
    
    return NextResponse.json({ success: true, message: 'Subscribed!' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
