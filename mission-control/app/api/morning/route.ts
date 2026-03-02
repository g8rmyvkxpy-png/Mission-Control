import { NextResponse } from 'next/server';

// Simple morning brief endpoint
// Returns weather info and a motivational message

export async function GET() {
  const hour = new Date().getUTCHours();
  
  // Simple greeting based on time
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';
  
  return NextResponse.json({
    greeting,
    message: 'Ready to build something amazing today! 🚀',
    weather: {
      location: 'India',
      condition: 'Clear',
      temp: '28°C',
      hint: 'Perfect for a morning run'
    },
    workout: {
      type: 'Cardio',
      duration: '30 mins',
      suggestion: 'Start with 10 jumping jacks, 20 squats, 15 pushups'
    },
    tips: [
      'Check your task queue for priorities',
      'Review AI agent activity',
      'Ship one small thing today'
    ],
    timestamp: new Date().toISOString()
  });
}
