import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REVENUE_FILE = path.join(process.cwd(), '.revenue.json');

function getRevenueData() {
  if (fs.existsSync(REVENUE_FILE)) {
    return JSON.parse(fs.readFileSync(REVENUE_FILE, 'utf8'));
  }
  return {
    current: 0,
    milestones: [
      { amount: 10000, reached: false, date: null },
      { amount: 50000, reached: false, date: null },
      { amount: 100000, reached: false, date: null },
      { amount: 250000, reached: false, date: null },
      { amount: 500000, reached: false, date: null },
      { amount: 1000000, reached: false, date: null }
    ],
    history: [],
    launchDate: new Date().toISOString().split('T')[0]
  };
}

function saveRevenueData(data) {
  fs.writeFileSync(REVENUE_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = getRevenueData();
  const progress = data.current / 1000000 * 100;
  
  return NextResponse.json({
    current: data.current,
    goal: 1000000,
    progress: progress.toFixed(2),
    milestones: data.milestones,
    launchDate: data.launchDate,
    daysSinceLaunch: Math.floor((Date.now() - new Date(data.launchDate).getTime()) / (1000 * 60 * 60 * 24))
  });
}

export async function POST(request) {
  const body = await request.json();
  const { amount, source } = body;
  
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  
  const data = getRevenueData();
  const previous = data.current;
  data.current = amount;
  
  // Check for milestone reached
  const today = new Date().toISOString().split('T')[0];
  for (const milestone of data.milestones) {
    if (previous < milestone.amount && amount >= milestone.amount && !milestone.reached) {
      milestone.reached = true;
      milestone.date = today;
    }
  }
  
  // Add to history
  data.history.push({
    amount,
    source: source || 'manual',
    date: today,
    timestamp: new Date().toISOString()
  });
  
  saveRevenueData(data);
  
  return NextResponse.json({
    success: true,
    current: data.current,
    progress: (data.current / 1000000 * 100).toFixed(2)
  });
}
