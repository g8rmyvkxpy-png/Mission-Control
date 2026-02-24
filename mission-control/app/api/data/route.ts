import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data.json');

export async function GET() {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({
      tasks: [],
      content: [],
      activities: [],
      memories: [],
      chatMessages: []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    fs.writeFileSync(dataFile, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
