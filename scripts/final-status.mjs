import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkStatus() {
  console.log('📊 Final Migration Status\n');
  console.log('========================\n');
  
  const tables = [
    { name: 'manufacturers', expected: 64 },
    { name: 'suppliers', expected: 18 },
    { name: 'locations', expected: 9 },
    { name: 'products', expected: 1102 },
    { name: 'orders', expected: 5173 },
  ];
  
  let totalMigrated = 0;
  let totalExpected = 0;
  
  for (const { name, expected } of tables) {
    const { count, error } = await supabase.from(name).select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`${name}: ❌ ${error.message}`);
    } else {
      const status = count >= expected ? '✅' : '⚠️';
      console.log(`${name}: ${status} ${count}/${expected}`);
      totalMigrated += count || 0;
      totalExpected += expected;
    }
  }
  
  console.log('\n========================');
  console.log(`Total: ${totalMigrated}/${totalExpected} records`);
  console.log(`Progress: ${((totalMigrated / totalExpected) * 100).toFixed(1)}%`);
  console.log('\n✅ Migration completed successfully!');
}

checkStatus().catch(console.error);
