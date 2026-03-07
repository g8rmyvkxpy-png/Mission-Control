const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@host:5432/db'
});

async function createTable() {
  // Get connection string from env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // The connection string should be like: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
  const projectRef = supabaseUrl?.split('://')[1]?.split('.')[0];
  
  if (!projectRef) {
    console.log('Cannot determine project ref from URL');
    process.exit(1);
  }
  
  console.log('Project ref:', projectRef);
  console.log('Note: Please run the SQL manually in Supabase SQL Editor:');
  console.log('File: supabase/second_brain.sql');
}

createTable().catch(console.error);
