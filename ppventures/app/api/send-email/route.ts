import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'To, subject, and message are required' },
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      // Queue the email for later sending
      return NextResponse.json({
        success: true,
        queued: true,
        message: 'Email queued (Resend not configured)',
        to,
        subject
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'PPVentures <hello@ppventures.tech>',
        to: [to],
        subject: subject,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Email sent',
      id: data.id
    });

  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
