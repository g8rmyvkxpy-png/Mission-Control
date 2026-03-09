import { db } from '../../../../lib/rag-db';
import { answerQuery, getAnalytics } from '../../../../lib/rag-engine';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { clientId, query } = await request.json();
    
    if (!clientId || !query) {
      return Response.json({ error: 'clientId and query required' }, { status: 400 });
    }
    
    const result = await answerQuery(clientId, query);
    
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const analytics = getAnalytics(clientId);
  
  return Response.json(analytics);
}
