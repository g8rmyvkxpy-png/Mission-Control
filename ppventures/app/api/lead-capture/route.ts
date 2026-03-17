import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

const LEADS_FILE = join(process.cwd(), 'data', 'leads.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, source, product } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const lead = {
      id: Date.now().toString(),
      name: name || '',
      email,
      company: company || '',
      source: source || 'website',
      product: product || '',
      status: 'new',
      created_at: new Date().toISOString()
    };

    // Read existing leads
    let leads = [];
    try {
      const fs = await import('fs');
      if (fs.existsSync(LEADS_FILE)) {
        const data = fs.readFileSync(LEADS_FILE, 'utf-8');
        leads = JSON.parse(data);
      }
    } catch (e) {
      leads = [];
    }

    // Add new lead
    leads.push(lead);

    // Write back
    const fs = await import('fs');
    const dir = join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully'
    });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fs = await import('fs');
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}
