import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://72.62.231.18:3004/api/clients');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
