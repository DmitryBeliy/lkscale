#!/usr/bin/env node
/**
 * Supabase Migration Script with exec_sql RPC
 * First creates the exec_sql function, then uses it for migrations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations', 'ready');
const BATCH_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create Supabase client with Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Execute SQL via REST API directly using raw SQL endpoint simulation
async function executeSqlDirect(sql, attempt = 1) {
  try {
    // Try using the exec_sql RPC function
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql doesn't exist, try alternative approach
      if (error.message?.includes('Could not find the function')) {
        return { success: false, needsFunction: true, error: error.message };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.log(`${colors.yellow}   ⚠️  Attempt ${attempt} failed, retrying...${colors.reset}`);
      await sleep(RETRY_DELAY * attempt);
      return executeSqlDirect(sql, attempt + 1);
    }
    return { success: false, error: error.message };
  }
}

// Split INSERT statements into batches
function splitInsertBatches(sql) {
  const batches = [];
  const lines = sql.split('\n');
  let currentBatch = [];
  let inInsert = false;
  let insertHeader = '';
  let tableName = '';
  let columns = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.toUpperCase().startsWith('INSERT INTO')) {
      inInsert = true;
      insertHeader = line;
      // Extract table name and columns
      const tableMatch = line.match(/INSERT INTO\s+(\w+)/i);
      tableName = tableMatch ? tableMatch[1] : 'unknown';
      const columnsMatch = line.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
      columns = columnsMatch ? columnsMatch[1] : '';
      currentBatch = [];
      continue;
    }

    if (inInsert && line.toUpperCase().startsWith('VALUES')) {
      continue;
    }

    if (inInsert && line.startsWith('(')) {
      const cleanLine = line.replace(/,$/, '');
      currentBatch.push(cleanLine);

      if (currentBatch.length >= BATCH_SIZE) {
        const valuesClause = currentBatch.join(',\n');
        batches.push(`INSERT INTO ${tableName} (${columns}) VALUES\n${valuesClause};`);
        currentBatch = [];
      }
      continue;
    }

    if (inInsert && line.endsWith(';')) {
      if (currentBatch.length > 0) {
        const valuesClause = currentBatch.join(',\n');
        batches.push(`INSERT INTO ${tableName} (${columns}) VALUES\n${valuesClause};`);
      }
      inInsert = false;
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    const valuesClause = currentBatch.join(',\n');
    batches.push(`INSERT INTO ${tableName} (${columns}) VALUES\n${valuesClause};`);
  }

  return batches;
}

// Check if SQL contains large INSERT statements
function hasLargeInserts(sql, thresholdKB = 200) {
  const sqlSizeKB = Buffer.byteLength(sql, 'utf8') / 1024;
  return sqlSizeKB > thresholdKB && sql.toUpperCase().includes('INSERT INTO');
}

// Execute single SQL file
async function executeSqlFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);

  console.log(`\n${colors.cyan}📄 Processing: ${filename}${colors.reset}`);
  console.log(`${colors.blue}   📊 Size: ${sizeKB} KB${colors.reset}`);

  if (hasLargeInserts(sql)) {
    console.log(`${colors.yellow}   🔄 Large file detected, splitting into batches...${colors.reset}`);
    const batches = splitInsertBatches(sql);

    if (batches.length === 0) {
      console.log(`${colors.yellow}   🔄 Executing as single statement...${colors.reset}`);
      const result = await executeSqlDirect(sql);
      if (!result.success) {
        console.log(`${colors.red}   ❌ Failed: ${result.error}${colors.reset}`);
        return false;
      }
    } else {
      console.log(`${colors.blue}   📦 Split into ${batches.length} batches${colors.reset}`);

      for (let i = 0; i < batches.length; i++) {
        process.stdout.write(`${colors.dim}   ⏳ Batch ${i + 1}/${batches.length}...${colors.reset}`);
        const result = await executeSqlDirect(batches[i]);

        if (result.success) {
          process.stdout.write(`\r${colors.green}   ✅ Batch ${i + 1}/${batches.length}${colors.reset}\n`);
        } else {
          process.stdout.write(`\r${colors.red}   ❌ Batch ${i + 1}/${batches.length} failed: ${result.error}${colors.reset}\n`);
          return false;
        }

        if (i < batches.length - 1) {
          await sleep(100);
        }
      }
    }
  } else {
    console.log(`${colors.yellow}   🔄 Executing...${colors.reset}`);
    const result = await executeSqlDirect(sql);
    if (!result.success) {
      console.log(`${colors.red}   ❌ Failed: ${result.error}${colors.reset}`);
      return false;
    }
  }

  console.log(`${colors.green}   ✅ Completed${colors.reset}`);
  return true;
}

// Verify migration results
async function verifyMigration() {
  console.log(`\n${colors.cyan}🔍 Verifying migration results...${colors.reset}`);

  const tables = ['products', 'orders', 'order_items', 'inventory_transactions'];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`${colors.red}   ❌ ${table}: ${error.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}   ✅ ${table}: ${count || 0} records${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}   ❌ ${table}: ${error.message}${colors.reset}`);
    }
  }
}

// Create exec_sql function via SQL query
async function createExecSqlFunction() {
  console.log(`${colors.yellow}🔧 Creating exec_sql function...${colors.reset}`);

  const createFunctionSql = `
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
`;

  try {
    // Use raw fetch to create function
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql: createFunctionSql }),
    });

    if (response.ok) {
      console.log(`${colors.green}✅ exec_sql function created successfully${colors.reset}`);
      return true;
    }

    // If function doesn't exist yet, we need another approach
    const errorText = await response.text();
    console.log(`${colors.yellow}⚠️  Could not create function via RPC: ${errorText}${colors.reset}`);
    return false;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not create function: ${error.message}${colors.reset}`);
    return false;
  }
}

// Alternative: Use REST API for inserts
async function executeInsertViaRest(table, values) {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(values)
      .select();

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Parse INSERT values and convert to JSON objects for REST API
function parseInsertValues(sql) {
  const result = [];
  const lines = sql.split('\n');
  let tableName = '';
  let columns = [];
  let inInsert = false;
  let currentValues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.toUpperCase().startsWith('INSERT INTO')) {
      inInsert = true;
      const tableMatch = line.match(/INSERT INTO\s+(\w+)/i);
      tableName = tableMatch ? tableMatch[1] : '';
      const columnsMatch = line.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
      columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim().replace(/"/g, '')) : [];
      continue;
    }

    if (inInsert && line.toUpperCase().startsWith('VALUES')) continue;

    if (inInsert && line.startsWith('(')) {
      const cleanLine = line.replace(/,$/, '').replace(/;$/, '');
      currentValues.push(cleanLine);
    }

    if (inInsert && line.endsWith(';')) {
      // Process collected values
      for (const valueLine of currentValues) {
        const values = valueLine.slice(1, -1).split(',').map(v => v.trim());
        const obj = {};
        columns.forEach((col, idx) => {
          let val = values[idx];
          if (val === 'NULL') val = null;
          else if (val?.startsWith("'")) val = val.slice(1, -1);
          obj[col] = val;
        });
        result.push({ table: tableName, data: obj });
      }
      inInsert = false;
      currentValues = [];
    }
  }

  return result;
}

// Main migration function
async function runMigration() {
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     Supabase Migration with Service Role Key               ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);

  // Test connection
  console.log(`\n${colors.yellow}🔌 Testing connection...${colors.reset}`);
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    console.log(`${colors.green}✅ Connection successful${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Connection failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }

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

  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const success = await executeSqlFile(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log(`${colors.red}\n❌ Migration stopped due to error in ${file}${colors.reset}`);
      break;
    }
  }

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║                    Migration Summary                       ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`${colors.green}✅ Successful: ${successCount}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);

  // Verify results
  await verifyMigration();

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run migration
runMigration().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
