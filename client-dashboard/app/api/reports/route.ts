import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  
  try {
    const url = clientId 
      ? `http://72.62.231.18:3004/api/reports?clientId=${clientId}`
      : 'http://72.62.231.18:3004/api/reports';
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
