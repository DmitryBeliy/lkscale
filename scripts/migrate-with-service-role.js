#!/usr/bin/env node
/**
 * Supabase Migration Script with Service Role Key
 * Features:
 * - Uses Service Role Key to bypass RLS
 * - Splits large INSERT operations into batches of 1000
 * - Retry logic with exponential backoff
 * - Progress logging
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
const RETRY_DELAY = 2000; // ms

// Color codes for console output
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

// Create Supabase client with Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Execute SQL with retry logic
async function executeWithRetry(sql, attempt = 1) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.log(`${colors.yellow}   ⚠️  Attempt ${attempt} failed, retrying in ${RETRY_DELAY * attempt}ms...${colors.reset}`);
      await sleep(RETRY_DELAY * attempt);
      return executeWithRetry(sql, attempt + 1);
    }
    return { success: false, error };
  }
}

// Split INSERT statements into batches
function splitInsertBatches(sql) {
  const batches = [];
  const lines = sql.split('\n');
  let currentBatch = [];
  let inInsert = false;
  let insertHeader = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for INSERT statement start
    if (line.toUpperCase().startsWith('INSERT INTO')) {
      inInsert = true;
      insertHeader = line;
      currentBatch = [];
      continue;
    }

    // Check for VALUES line
    if (inInsert && line.toUpperCase().startsWith('VALUES')) {
      continue;
    }

    // Check for value rows (lines starting with '(')
    if (inInsert && line.startsWith('(')) {
      // Remove trailing comma if present
      const cleanLine = line.replace(/,$/, '');
      currentBatch.push(cleanLine);

      // When batch is full, create a complete INSERT statement
      if (currentBatch.length >= BATCH_SIZE) {
        const valuesClause = currentBatch.join(',\n');
        // Extract table name from insertHeader
        const tableMatch = insertHeader.match(/INSERT INTO\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'unknown';
        // Extract columns from insertHeader
        const columnsMatch = insertHeader.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
        const columns = columnsMatch ? columnsMatch[1] : '*';

        batches.push(`INSERT INTO ${tableName} (${columns}) VALUES\n${valuesClause};`);
        currentBatch = [];
      }
      continue;
    }

    // Check for end of INSERT (semicolon)
    if (inInsert && line.endsWith(';')) {
      if (currentBatch.length > 0) {
        const valuesClause = currentBatch.join(',\n');
        const tableMatch = insertHeader.match(/INSERT INTO\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'unknown';
        const columnsMatch = insertHeader.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
        const columns = columnsMatch ? columnsMatch[1] : '*';

        batches.push(`INSERT INTO ${tableName} (${columns}) VALUES\n${valuesClause};`);
      }
      inInsert = false;
      currentBatch = [];
      insertHeader = '';
    }
  }

  // Handle any remaining values
  if (currentBatch.length > 0) {
    const valuesClause = currentBatch.join(',\n');
    const tableMatch = insertHeader.match(/INSERT INTO\s+(\w+)/i);
    const tableName = tableMatch ? tableMatch[1] : 'unknown';
    const columnsMatch = insertHeader.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
    const columns = columnsMatch ? columnsMatch[1] : '*';

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

  // Check if file needs batching
  if (hasLargeInserts(sql)) {
    console.log(`${colors.yellow}   🔄 Large file detected, splitting into batches...${colors.reset}`);
    const batches = splitInsertBatches(sql);

    if (batches.length === 0) {
      // No INSERT batches found, execute as-is
      console.log(`${colors.yellow}   🔄 Executing as single statement...${colors.reset}`);
      const result = await executeWithRetry(sql);
      if (!result.success) {
        console.log(`${colors.red}   ❌ Failed: ${result.error?.message || 'Unknown error'}${colors.reset}`);
        return false;
      }
    } else {
      console.log(`${colors.blue}   📦 Split into ${batches.length} batches${colors.reset}`);

      for (let i = 0; i < batches.length; i++) {
        process.stdout.write(`${colors.dim}   ⏳ Batch ${i + 1}/${batches.length}...${colors.reset}`);
        const result = await executeWithRetry(batches[i]);

        if (result.success) {
          process.stdout.write(`\r${colors.green}   ✅ Batch ${i + 1}/${batches.length}${colors.reset}\n`);
        } else {
          process.stdout.write(`\r${colors.red}   ❌ Batch ${i + 1}/${batches.length} failed: ${result.error?.message || 'Unknown error'}${colors.reset}\n`);
          return false;
        }

        // Small delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await sleep(100);
        }
      }
    }
  } else {
    // Small file, execute as-is
    console.log(`${colors.yellow}   🔄 Executing...${colors.reset}`);
    const result = await executeWithRetry(sql);
    if (!result.success) {
      console.log(`${colors.red}   ❌ Failed: ${result.error?.message || 'Unknown error'}${colors.reset}`);
      return false;
    }
  }

  console.log(`${colors.green}   ✅ Completed${colors.reset}`);
  return true;
}

// Verify migration results
async function verifyMigration() {
  console.log(`\n${colors.cyan}🔍 Verifying migration results...${colors.reset}`);

  const queries = [
    { name: 'products', query: 'SELECT COUNT(*) FROM products' },
    { name: 'orders', query: 'SELECT COUNT(*) FROM orders' },
    { name: 'order_items', query: 'SELECT COUNT(*) FROM order_items' },
    { name: 'inventory_transactions', query: 'SELECT COUNT(*) FROM inventory_transactions' },
  ];

  for (const { name, query } of queries) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: query
      });

      if (error) {
        console.log(`${colors.red}   ❌ ${name}: ${error.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}   ✅ ${name}: ${data?.[0]?.count || 0} records${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}   ❌ ${name}: ${error.message}${colors.reset}`);
    }
  }
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
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
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
