import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const CONTACTS_FILE = join(DATA_DIR, 'ppventures-contacts.json');

// CORS headers for external requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  try {
    const fs = await import('fs');
    if (!existsSync(CONTACTS_FILE)) {
      return NextResponse.json({ contacts: [], total: 0 }, { headers: corsHeaders });
    }
    const data = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    const contacts = JSON.parse(data);
    return NextResponse.json({ contacts, total: contacts.length }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read contacts' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { name, email, service, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    // Read existing contacts or create empty array
    let contacts: any[] = [];
    if (existsSync(CONTACTS_FILE)) {
      const data = await import('fs').then(fs => fs.readFileSync(CONTACTS_FILE, 'utf-8'));
      contacts = JSON.parse(data);
    }

    // Add new contact
    const newContact = {
      id: `lead-${Date.now()}`,
      name,
      email,
      service: service || 'not specified',
      message,
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    contacts.push(newContact);

    // Save to file
    await writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));

    return NextResponse.json(
      { success: true, contact: newContact },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500, headers: corsHeaders }
    );
  }
}
