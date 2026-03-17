import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWelcomeEmail({ name, email, businessName }: { name: string; email: string; businessName: string }) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: true, id: 'mock-email-id' };
  }
  
  const fromEmail = process.env.FROM_EMAIL || 'hello@ppventures.tech';
  
  try {
    return await resend.emails.send({
      from: `PPVentures <${fromEmail}>`,
      to: email,
      subject: `Welcome to PPVentures, ${name}! Your agents are ready 🤖`,
      html: `
        <div style="background:#0a0f1e;color:#ffffff;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#10b981;font-size:28px;">◆ PPVentures</h1>
          </div>
          <h2 style="font-size:24px;margin-bottom:16px;">Welcome, ${name}! 🎉</h2>
          <p style="color:#94a3b8;line-height:1.6;">Your AI agents are being configured for <strong style="color:#ffffff;">${businessName}</strong> right now.</p>
          <p style="color:#94a3b8;line-height:1.6;">Here is what happens next:</p>
          <div style="background:#1e2333;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="margin:8px 0;">✅ <strong>Neo</strong> is finding your first leads</p>
            <p style="margin:8px 0;">✅ <strong>Atlas</strong> is researching your industry</p>
            <p style="margin:8px 0;">✅ <strong>Orbit</strong> is setting up your daily reports</p>
          </div>
          <p style="color:#94a3b8;line-height:1.6;">Your 14-day free trial starts today. No credit card needed.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="http://72.62.231.18:3005" style="background:#10b981;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">→ Access Your Dashboard</a>
          </div>
          <p style="color:#64748b;font-size:14px;text-align:center;">Questions? Reply to this email or contact us at hello@ppventures.tech</p>
          <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">© 2026 PPVentures · Built by AI agents 24/7</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, id: null };
  }
}

export async function sendInternalNotification({ name, email, businessName }: { name: string; email: string; businessName: string }) {
  if (!resend) {
    console.log('Resend not configured, skipping notification');
    return { success: true, id: 'mock-email-id' };
  }
  
  const fromEmail = process.env.FROM_EMAIL || 'hello@ppventures.tech';
  const notifyEmail = process.env.NOTIFY_EMAIL || 'palanid.789@gmail.com';
  
  try {
    return await resend.emails.send({
      from: `PPVentures <${fromEmail}>`,
      to: notifyEmail,
      subject: `🔔 New trial signup: ${name} from ${businessName}`,
      html: `
        <div style="background:#0a0f1e;color:#ffffff;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
          <h2 style="color:#10b981;font-size:24px;margin-bottom:16px;">🔔 New trial signup!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Business:</strong> ${businessName}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p style="margin-top:24px;"><a href="http://72.62.231.18:3005" style="background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View in Command Centre →</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, id: null };
  }
}
