import { v4 as uuidv4 } from 'uuid';
import { db } from '../../.../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  
  if (clientId) {
    const leads = db.prepare('SELECT * FROM leads WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
    return Response.json({ leads });
  }
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  return Response.json({ leads });
}

export async function POST(request) {
  const { client_id, name, company, linkedin, email, fit_score } = await request.json();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  
  const id = uuidv4();
  
  try {
    db.prepare(`
      INSERT INTO leads (id, client_id, name, company, linkedin, email, fit_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, client_id || clientId, name, company, linkedin, email, fit_score || 5);
    
    return Response.json({ 
      success: true, 
      lead: { id, client_id: client_id || clientId, name, company, fit_score }
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
