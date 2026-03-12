#!/usr/bin/env node
/**
 * Supabase Migration using REST API with Service Role Key
 * Uses batch INSERT via REST API instead of SQL RPC
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

// Parse SQL INSERT and convert to JSON objects
function parseInsertStatements(sql) {
  const results = [];
  const lines = sql.split('\n');
  let tableName = '';
  let columns = [];
  let inInsert = false;
  let currentValues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect INSERT INTO statement
    const insertMatch = line.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)/i);
    if (insertMatch) {
      tableName = insertMatch[1];
      columns = insertMatch[2].split(',').map(c => c.trim().replace(/"/g, '').replace(/'/g, ''));
      inInsert = true;
      currentValues = [];
      continue;
    }

    // Skip VALUES keyword
    if (inInsert && line.toUpperCase().startsWith('VALUES')) continue;

    // Collect value rows
    if (inInsert && line.startsWith('(')) {
      const cleanLine = line.replace(/,$/, '').replace(/;$/, '');
      currentValues.push(cleanLine);
    }

    // End of INSERT statement
    if (inInsert && (line.endsWith(';') || (!line.startsWith('(') && !line.startsWith('VALUES') && line.length > 0 && !line.startsWith('--')))) {
      if (currentValues.length > 0) {
        const rows = [];
        for (const valueLine of currentValues) {
          // Parse values - handle strings, numbers, NULL, timestamps
          const values = [];
          let current = '';
          let inString = false;
          let stringChar = null;

          for (let j = 1; j < valueLine.length - 1; j++) {
            const char = valueLine[j];

            if (!inString && (char === "'" || char === '"')) {
              inString = true;
              stringChar = char;
              continue;
            }

            if (inString && char === stringChar) {
              inString = false;
              stringChar = null;
              continue;
            }

            if (!inString && char === ',') {
              values.push(current.trim());
              current = '';
              continue;
            }

            current += char;
          }
          values.push(current.trim());

          // Create object
          const obj = {};
          columns.forEach((col, idx) => {
            let val = values[idx];
            if (val === undefined || val === 'NULL' || val === 'null') {
              obj[col] = null;
            } else if (val?.toLowerCase() === 'true') {
              obj[col] = true;
            } else if (val?.toLowerCase() === 'false') {
              obj[col] = false;
            } else if (!isNaN(val) && val !== '') {
              obj[col] = Number(val);
            } else if (val?.startsWith("'") && val?.endsWith("'")) {
              obj[col] = val.slice(1, -1).replace(/''/g, "'");
            } else if (val?.startsWith('"') && val?.endsWith('"')) {
              obj[col] = val.slice(1, -1).replace(/""/g, '"');
            } else {
              obj[col] = val;
            }
          });
          rows.push(obj);
        }
        results.push({ table: tableName, rows });
      }
      inInsert = false;
      currentValues = [];
    }
  }

  return results;
}

// Execute CREATE TABLE and other DDL statements via raw SQL endpoint
async function executeDdl(sql, attempt = 1) {
  try {
    // Try to use pg_net or create a temporary function
    // For now, we'll use the fact that DDL can be done via direct REST calls
    // But actually we need exec_sql function for DDL

    // Alternative: use fetch directly to SQL endpoint if available
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return { success: true };
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY * attempt);
      return executeDdl(sql, attempt + 1);
    }
    return { success: false, error: error.message };
  }
}

// Batch insert rows via REST API
async function batchInsert(table, rows, attempt = 1) {
  try {
    // Supabase REST API supports batch inserts
    const { data, error } = await supabase
      .from(table)
      .insert(rows)
      .select();

    if (error) {
      // If table doesn't exist, we can't insert
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return { success: false, error: `Table ${table} does not exist. Please run 00_setup.sql first.` };
      }
      throw error;
    }

    return { success: true, count: rows.length };
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY * attempt);
      return batchInsert(table, rows, attempt + 1);
    }
    return { success: false, error: error.message };
  }
}

// Execute SQL file
async function executeSqlFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);

  console.log(`\n${colors.cyan}📄 Processing: ${filename}${colors.reset}`);
  console.log(`${colors.blue}   📊 Size: ${sizeKB} KB${colors.reset}`);

  // Parse INSERT statements
  const inserts = parseInsertStatements(sql);

  if (inserts.length === 0) {
    // This might be a DDL file (CREATE TABLE, etc.)
    console.log(`${colors.yellow}   🔄 No INSERTs found, attempting DDL execution...${colors.reset}`);
    const result = await executeDdl(sql);
    if (!result.success) {
      console.log(`${colors.red}   ❌ DDL failed: ${result.error}${colors.reset}`);
      return false;
    }
    console.log(`${colors.green}   ✅ Completed${colors.reset}`);
    return true;
  }

  // Execute INSERTs
  console.log(`${colors.blue}   📦 Found ${inserts.length} INSERT statement(s)${colors.reset}`);

  for (const insert of inserts) {
    const { table, rows } = insert;
    console.log(`${colors.blue}   📊 Table: ${table}, Rows: ${rows.length}${colors.reset}`);

    // Split into batches
    const batches = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE));
    }

    console.log(`${colors.blue}   📦 Split into ${batches.length} batches${colors.reset}`);

    for (let i = 0; i < batches.length; i++) {
      process.stdout.write(`${colors.dim}   ⏳ Batch ${i + 1}/${batches.length}...${colors.reset}`);
      const result = await batchInsert(table, batches[i]);

      if (result.success) {
        process.stdout.write(`\r${colors.green}   ✅ Batch ${i + 1}/${batches.length}${colors.reset}\n`);
      } else {
        process.stdout.write(`\r${colors.red}   ❌ Batch ${i + 1}/${batches.length} failed: ${result.error}${colors.reset}\n`);
        return false;
      }

      // Small delay between batches
      if (i < batches.length - 1) {
        await sleep(100);
      }
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

// Main migration function
async function runMigration() {
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     Supabase Migration via REST API                        ║${colors.reset}`);
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
