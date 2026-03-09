import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../lib/db';

export default function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { email, action } = req.body;
    
    if (action === 'login') {
      const client = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);
      if (client) {
        return res.status(200).json({ client });
      }
      return res.status(404).json({ error: 'Client not found' });
    }

    if (action === 'register') {
      const { name, business_name, niche, target_audience, tier } = req.body;
      const id = uuidv4();
      const trial_end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      
      try {
        db.prepare(`
          INSERT INTO clients (id, name, business_name, email, niche, target_audience, tier, trial_end)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, name, business_name, email, niche, target_audience, tier || 'starter', trial_end);
        
        const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
        return res.status(201).json({ client });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
