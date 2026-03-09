import { db } from '../../../../lib/rag-db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const documentId = searchParams.get('documentId');
  
  if (documentId) {
    // Get specific document with chunks
    const document = db.prepare('SELECT * FROM rag_documents WHERE id = ?').get(documentId);
    const chunks = db.prepare('SELECT * FROM rag_chunks WHERE document_id = ? ORDER BY chunk_index').all(documentId);
    
    return Response.json({ document, chunks });
  }
  
  if (clientId) {
    // Get all documents for client
    const documents = db.prepare(`
      SELECT d.*, COUNT(c.id) as chunk_count 
      FROM rag_documents d 
      LEFT JOIN rag_chunks c ON d.id = c.document_id 
      WHERE d.client_id = ? 
      GROUP BY d.id 
      ORDER BY d.created_at DESC
    `).all(clientId);
    
    return Response.json({ documents });
  }
  
  // Get all documents (admin)
  const documents = db.prepare(`
    SELECT d.*, c.business_name as client_name, COUNT(ch.id) as chunk_count 
    FROM rag_documents d 
    LEFT JOIN clients c ON d.client_id = c.id
    LEFT JOIN rag_chunks ch ON d.id = ch.document_id 
    GROUP BY d.id 
    ORDER BY d.created_at DESC
  `).all();
  
  return Response.json({ documents });
}
