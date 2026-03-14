import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSchema() {
  console.log('Checking database schema...\n');
  
  // Check what tables exist by trying to query them
  const tables = ['manufacturers', 'suppliers', 'locations', 'products', 'orders', 'order_products', 'consignment_notes'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
      if (error) {
        console.log(`${table}: ❌ ${error.message}`);
      } else {
        console.log(`${table}: ✅ exists, ${count} records`);
        if (data && data[0]) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (e) {
      console.log(`${table}: ❌ Error`);
    }
  }
}

checkSchema().catch(console.error);
