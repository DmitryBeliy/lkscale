const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODE5ODcsImV4cCI6MjA4ODA1Nzk4N30.zB_-3Ta9pil-UcKB-OMTgLZWdCdciFlhOuk1x6Dy50g';

// Migration files in order
const migrationFiles = [
  '00_setup.sql',
  'part_001.sql',
  'part_002.sql',
  'part_003_part001.sql',
  'part_003_part002.sql',
  'part_004_part001.sql',
  'part_004_part002.sql',
  'part_005_part001.sql',
  'part_005_part002.sql',
  'part_006_part001.sql',
  'part_006_part002.sql',
];

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations', 'ready');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function executeSql(sql, filename) {
  try {
    // Try to execute SQL via REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'tx=commit'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeViaRpc(sql, filename) {
  try {
    // Try using pg_exec or similar RPC function if available
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runMigration(filename) {
  const filepath = path.join(migrationsDir, filename);
  
  log(`\n📄 Processing: ${filename}`, 'cyan');
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    log(`   ❌ File not found: ${filepath}`, 'red');
    return false;
  }
  
  // Read SQL file
  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (sql.length / 1024).toFixed(2);
  log(`   📊 Size: ${sizeKB} KB`, 'blue');
  
  // Try to execute via different methods
  let result;
  
  // Method 1: Try RPC
  log(`   🔄 Attempting via RPC...`, 'yellow');
  result = await executeViaRpc(sql, filename);
  
  if (!result.success) {
    log(`   ⚠️  RPC failed: ${result.error}`, 'yellow');
    
    // Method 2: Try REST API
    log(`   🔄 Attempting via REST API...`, 'yellow');
    result = await executeSql(sql, filename);
  }
  
  if (result.success) {
    log(`   ✅ Success!`, 'green');
    return true;
  } else {
    log(`   ❌ Failed: ${result.error}`, 'red');
    return false;
  }
}

async function verifyData() {
  log(`\n🔍 Verifying data...`, 'cyan');
  
  const tables = [
    'categories',
    'suppliers',
    'manufacturers',
    'products',
    'orders',
    'order_items',
    'inventory_transactions'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        log(`   ⚠️  ${table}: ${error.message}`, 'yellow');
      } else {
        log(`   ✅ ${table}: ${count || 0} rows`, 'green');
      }
    } catch (err) {
      log(`   ❌ ${table}: ${err.message}`, 'red');
    }
  }
}

async function main() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Supabase Database Migration Tool                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n🔗 Connecting to: ${SUPABASE_URL}`, 'blue');
  
  // Test connection
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      log(`⚠️  Connection test: ${error.message}`, 'yellow');
    } else {
      log(`✅ Connection established`, 'green');
    }
  } catch (err) {
    log(`❌ Connection failed: ${err.message}`, 'red');
    return;
  }
  
  // Run migrations
  let successCount = 0;
  let failCount = 0;
  
  for (const filename of migrationFiles) {
    const success = await runMigration(filename);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  log(`\n╔════════════════════════════════════════════════════════╗`, 'cyan');
  log('║     Migration Summary                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  log(`   ✅ Successful: ${successCount}`, 'green');
  log(`   ❌ Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  
  // Verify data
  await verifyData();
  
  if (failCount > 0) {
    log(`\n⚠️  IMPORTANT NOTE:`, 'yellow');
    log(`   Anon Key has limited permissions and cannot execute arbitrary SQL.`, 'yellow');
    log(`   For full migrations, you need to:`, 'yellow');
    log(`   1. Use Service Role Key (SUPABASE_SERVICE_ROLE_KEY)`, 'yellow');
    log(`   2. Or execute SQL files via Supabase Dashboard > SQL Editor`, 'yellow');
    log(`   3. Or use Supabase CLI with appropriate permissions`, 'yellow');
  }
  
  log('\n🏁 Migration process completed\n', 'cyan');
}

main().catch(err => {
  log(`\n❌ Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
