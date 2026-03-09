import { processDocument } from '../../../../lib/rag-engine';
import { db } from '../../../../lib/rag-db';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const clientId = formData.get('clientId');
    const title = formData.get('title') || 'Untitled Document';
    const file = formData.get('file');
    
    if (!clientId) {
      return Response.json({ error: 'clientId required' }, { status: 400 });
    }
    
    let content = '';
    let fileType = 'txt';
    
    if (file) {
      fileType = file.name.split('.').pop().toLowerCase();
      const text = await file.text();
      
      // Simple text extraction (in production, use proper parsers for PDF/DOCX)
      content = text;
    } else {
      // Plain text content
      content = formData.get('content') || '';
    }
    
    if (!content) {
      return Response.json({ error: 'No content provided' }, { status: 400 });
    }
    
    const result = await processDocument(clientId, title, content, fileType);
    
    return Response.json({
      success: true,
      documentId: result.documentId,
      chunksCreated: result.chunksCreated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  
  if (!clientId) {
    return Response.json({ error: 'clientId required' }, { status: 400 });
  }
  
  const documents = db.prepare(`
    SELECT * FROM rag_documents 
    WHERE client_id = ? 
    ORDER BY created_at DESC
  `).all(clientId);
  
  return Response.json({ documents });
}
