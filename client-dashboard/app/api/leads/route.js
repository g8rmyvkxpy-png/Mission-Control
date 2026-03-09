import { db } from '../../../lib/db';

export default function handler(req, res) {
  const { method, query } = req;
  const { clientId } = query;

  if (method === 'GET') {
    if (clientId) {
      const leads = db.prepare('SELECT * FROM leads WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
      return res.status(200).json({ leads });
    }
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 50').all();
    return res.status(200).json({ leads });
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
