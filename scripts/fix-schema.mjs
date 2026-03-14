import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSchema() {
  console.log('🔧 Fixing database schema...\n');
  
  // 1. Create locations table
  console.log('1. Creating locations table...');
  const { error: locError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id INTEGER UNIQUE,
        name TEXT NOT NULL,
        type INTEGER NOT NULL DEFAULT 1,
        address TEXT,
        phone TEXT,
        email TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Enable all access" ON locations FOR ALL USING (true) WITH CHECK (true);
    `
  });
  if (locError) {
    console.log(`   ❌ Error creating locations: ${locError.message}`);
    // Try direct REST API
    const { error: restError } = await supabase.from('locations').insert({
      id: '00000000-0000-0000-0000-000000000000',
      legacy_id: 0,
      name: 'Temp'
    });
    if (restError?.code === '42P01') {
      console.log('   Table does not exist, need to create via SQL Editor');
    }
  } else {
    console.log('   ✅ Locations table created');
  }
  
  // 2. Add currency_code column to products
  console.log('\n2. Adding currency_code to products...');
  const { error: colError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'RUB';`
  });
  if (colError) {
    console.log(`   ❌ Error: ${colError.message}`);
  } else {
    console.log('   ✅ currency_code column added');
  }
  
  // 3. Check current tables
  console.log('\n3. Checking existing tables...');
  const tables = ['manufacturers', 'suppliers', 'locations', 'products'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: ${count} records`);
    }
  }
}

fixSchema().catch(console.error);
