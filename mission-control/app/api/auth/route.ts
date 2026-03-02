import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user store (replace with Supabase in production)
const users = new Map<string, { id: string; name: string; email: string; password: string; organization_id: string }>();

// Initialize with a demo user
users.set('deva@example.com', {
  id: 'user-1',
  name: 'Deva',
  email: 'deva@example.com',
  password: 'password123',
  organization_id: '56b94071-3455-4967-9300-60788486a4fb'
});

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      const user = users.get(email.toLowerCase());
      
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = generateToken();
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          organization_id: user.organization_id,
          plan: 'pro'
        }
      });
    }

    if (action === 'register') {
      if (users.has(email.toLowerCase())) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password,
        organization_id: '56b94071-3455-4967-9300-60788486a4fb'
      };

      users.set(email.toLowerCase(), newUser);
      const token = generateToken();

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          organization_id: newUser.organization_id,
          plan: 'starter'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  // For demo, just return user info
  return NextResponse.json({
    user: {
      id: 'user-1',
      name: 'Deva',
      email: 'deva@example.com',
      organization_id: '56b94071-3455-4967-9300-60788486a4fb',
      plan: 'pro'
    }
  });
}
