import { db } from '../../../lib/db';

export default function handler(req, res) {
  const { method, query } = req;
  const { clientId } = query;

  if (method === 'GET') {
    if (clientId) {
      const reports = db.prepare('SELECT * FROM daily_reports WHERE client_id = ? ORDER BY report_date DESC').all(clientId);
      return res.status(200).json({ reports });
    }
    return res.status(400).json({ error: 'clientId required' });
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
