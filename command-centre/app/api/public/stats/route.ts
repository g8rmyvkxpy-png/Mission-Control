import { NextResponse } from 'next/server';

// In-memory counter for demo (replace with real database queries in production)
let tasksCompletedTotal = 847;
let tasksToday = 42;

// Simulate task completion for demo
export async function GET() {
  // In production, these would be real database queries
  // For now, return realistic numbers
  const now = new Date();
  const hour = now.getHours();
  
  // Simulate tasks accumulating through the day
  const simulatedTasksToday = Math.floor(Math.random() * 50) + 20 + hour * 3;
  
  return NextResponse.json({
    tasks_completed_today: simulatedTasksToday,
    tasks_completed_total: tasksCompletedTotal + simulatedTasksToday,
    agents_online: 3,
    agents: [
      { name: 'Neo', status: 'online', tasks_today: Math.floor(simulatedTasksToday * 0.5) },
      { name: 'Atlas', status: 'online', tasks_today: Math.floor(simulatedTasksToday * 0.3) },
      { name: 'Orbit', status: 'online', tasks_today: Math.floor(simulatedTasksToday * 0.2) },
    ]
  });
}
