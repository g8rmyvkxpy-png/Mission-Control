import { NextRequest, NextResponse } from 'next/server';

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

// In production, use Resend, SendGrid, or AWS SES
// For now, we'll log and simulate sending
export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, from }: EmailParams = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In production, integrate with:
    // - Resend: https://resend.com
    // - SendGrid: https://sendgrid.com
    // - AWS SES
    
    // For now, log the email (simulate sending)
    console.log('=== EMAIL SENT ===');
    console.log(`To: ${to}`);
    console.log(`From: ${from || 'noreply@missioncontrol.ai'}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log('====================');

    return NextResponse.json({
      success: true,
      message: 'Email queued for delivery',
      emailId: `email_${Date.now()}`
    });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

// Verify email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
