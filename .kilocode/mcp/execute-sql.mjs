import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sql = fs.readFileSync('create-tables.sql', 'utf8');

// Split SQL into individual statements
const statements = sql.split(';').filter(s => s.trim());

console.log(`Executing ${statements.length} SQL statements...\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i].trim();
  if (!stmt) continue;
  
  console.log(`Statement ${i + 1}: ${stmt.substring(0, 50)}...`);
  
  const { error } = await supabase.rpc('exec_sql', { sql: stmt });
  
  if (error) {
    console.log(`  ❌ Error: ${error.message}`);
  } else {
    console.log(`  ✅ OK`);
  }
}

console.log('\nDone!');
