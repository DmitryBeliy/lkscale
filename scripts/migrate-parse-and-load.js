#!/usr/bin/env node
/**
 * Supabase Migration: Parse SQL and Load via REST API
 * Parses INSERT statements and loads data using Supabase REST API with Service Role Key
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

// Create Supabase client with Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse SQL INSERT statements and convert to objects
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
      columns = insertMatch[2].split(',').map(c => c.trim().replace(/"/g, ''));
      inInsert = true;
      currentValues = [];
      continue;
    }

    // Skip VALUES keyword
    if (inInsert && line.toUpperCase().startsWith('VALUES')) continue;

    // Collect value rows - handle nested parentheses and strings
    if (inInsert && line.startsWith('(')) {
      // Simple parsing - may need improvement for complex cases
      const cleanLine = line.replace(/,$/, '').replace(/;$/, '');

      // Parse values considering quoted strings
      const values = [];
      let current = '';
      let inString = false;
      let stringChar = null;

      for (let j = 1; j < cleanLine.length - 1; j++) {
        const char = cleanLine[j];

        if (!inString && (char === "'")) {
          inString = true;
          stringChar = char;
          continue;
        }

        if (inString && char === stringChar) {
          // Check for escaped quote ('')
          if (cleanLine[j + 1] === "'") {
            current += "'";
            j++;
            continue;
          }
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
        } else {
          obj[col] = val;
        }
      });
      currentValues.push(obj);
    }

    // End of INSERT statement
    if (inInsert && (line.endsWith(';') || (line === '' && currentValues.length > 0))) {
      if (currentValues.length > 0) {
        results.push({ table: tableName, rows: currentValues });
        currentValues = [];
      }
      inInsert = false;
    }
  }

  // Handle any remaining values
  if (currentValues.length > 0) {
    results.push({ table: tableName, rows: currentValues });
  }

  return results;
}

// Batch insert via REST API with upsert (ignore duplicates)
async function batchInsert(table, rows, attempt = 1) {
  try {
    // Use upsert with ignoreDuplicates to skip existing records
    const { data, error } = await supabase
      .from(table)
      .upsert(rows, {
        onConflict: 'id',
        ignoreDuplicates: true
      })
      .select();

    if (error) {
      // If table doesn't exist, we can't insert
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return { success: false, needsSetup: true, error: `Table ${table} does not exist` };
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
async function executeSqlFile(filename, isFirst = false) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);

  console.log(`\n[${filename}]`);
  console.log(`  Size: ${sizeKB} KB`);

  // Parse INSERT statements
  const inserts = parseInsertStatements(sql);

  if (inserts.length === 0) {
    // This might be a DDL file (CREATE TABLE, etc.)
    console.log(`  No INSERTs found - DDL files need manual execution in Supabase SQL Editor`);
    if (isFirst) {
      console.log(`  Please run 00_setup.sql manually in Supabase Dashboard SQL Editor`);
      console.log(`  URL: https://supabase.com/dashboard/project/onnncepenxxxfprqaodu/sql/new`);
      return { success: false, isDdl: true };
    }
    return { success: true }; // Skip DDL files after setup
  }

  // Execute INSERTs
  console.log(`  Found ${inserts.length} INSERT statement(s)`);

  for (const insert of inserts) {
    const { table, rows } = insert;
    console.log(`  Table: ${table}, Rows: ${rows.length}`);

    // Split into batches
    const batches = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE));
    }

    console.log(`  Split into ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      process.stdout.write(`  Batch ${i + 1}/${batches.length}... `);
      const result = await batchInsert(table, batches[i]);

      if (result.success) {
        console.log(`OK`);
      } else if (result.needsSetup) {
        console.log(`FAILED - Table ${table} does not exist!`);
        console.log(`  Please run 00_setup.sql first in Supabase Dashboard SQL Editor`);
        return { success: false, needsSetup: true };
      } else {
        console.log(`FAILED: ${result.error}`);
        return { success: false };
      }

      // Small delay between batches
      if (i < batches.length - 1) {
        await sleep(100);
      }
    }
  }

  console.log(`  Completed`);
  return { success: true };
}

// Verify migration results
async function verifyMigration() {
  console.log(`\n[Verifying migration results]`);

  const tables = ['products', 'orders', 'order_items', 'inventory_transactions'];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ${table}: Error - ${error.message}`);
      } else {
        console.log(`  ${table}: ${count || 0} records`);
      }
    } catch (error) {
      console.log(`  ${table}: Error - ${error.message}`);
    }
  }
}

// Main migration function
async function runMigration() {
  console.log('='.repeat(60));
  console.log('Supabase Migration via REST API');
  console.log('='.repeat(60));

  // Test connection
  console.log('\n[Testing connection...]');
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    console.log('Connection: OK');
  } catch (error) {
    console.log(`Connection failed: ${error.message}`);
    process.exit(1);
  }

  // Migration files in order (skip 00_setup.sql as tables already exist)
  const migrationFiles = [
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
  let needsSetup = false;

  for (let i = 0; i < migrationFiles.length; i++) {
    const file = migrationFiles[i];
    const result = await executeSqlFile(file, i === 0);

    if (result.success) {
      successCount++;
    } else if (result.isDdl || result.needsSetup) {
      needsSetup = true;
      failCount++;
      break;
    } else {
      failCount++;
      console.log(`\nMigration stopped due to error in ${file}`);
      break;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (needsSetup) {
    console.log('\n[IMPORTANT]');
    console.log('Please execute 00_setup.sql manually in Supabase Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/onnncepenxxxfprqaodu/sql/new');
    console.log('2. Copy contents of supabase/migrations/ready/00_setup.sql');
    console.log('3. Paste and run');
    console.log('4. Then re-run this script');
  }

  // Verify results
  await verifyMigration();

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run migration
runMigration().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
