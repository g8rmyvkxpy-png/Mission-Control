import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new sqlite3('./data/users.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    organization_id TEXT,
    plan TEXT DEFAULT 'starter',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const JWT_SECRET = process.env.JWT_SECRET || 'mission-control-secret-key-2026';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json();

    if (action === 'register') {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `user_${Date.now()}`;
      const orgId = `org_${Date.now()}`;

      db.prepare('INSERT INTO users (id, email, password, name, organization_id) VALUES (?, ?, ?, ?, ?)')
        .run(userId, email, hashedPassword, name, orgId);

      const token = jwt.sign({ userId, email, orgId }, JWT_SECRET, { expiresIn: '7d' });

      return NextResponse.json({
        success: true,
        token,
        user: { id: userId, email, name, organization_id: orgId, plan: 'starter' }
      });
    }

    if (action === 'login') {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, orgId: user.organization_id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organization_id: user.organization_id,
          plan: user.plan
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, email, name, organization_id, plan FROM users WHERE id = ?')
      .get(decoded.userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
