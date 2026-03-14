#!/usr/bin/env node
/**
 * Supabase Migration Final - with column fixes for order_items
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations', 'ready');
const BATCH_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateUUID() {
  return crypto.randomUUID();
}

// Columns to skip for each table
const skipColumns = {
  order_items: ['cost_price', 'notes']
};

function parseInsertStatements(sql) {
  const results = [];
  const lines = sql.split('\n');
  let tableName = '';
  let columns = [];
  let inInsert = false;
  let currentValues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const insertMatch = line.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)/i);
    if (insertMatch) {
      tableName = insertMatch[1];
      columns = insertMatch[2].split(',').map(c => c.trim().replace(/"/g, ''));
      inInsert = true;
      currentValues = [];
      continue;
    }

    if (inInsert && line.toUpperCase().startsWith('VALUES')) continue;

    if (inInsert && line.startsWith('(')) {
      let processedLine = line.replace(/gen_random_uuid\(\)/gi, () => `'${generateUUID()}'`);
      processedLine = processedLine.replace(/now\(\)/gi, () => `'${new Date().toISOString()}'`);
      const cleanLine = processedLine.replace(/,$/, '').replace(/;$/, '');

      const values = [];
      let current = '';
      let inString = false;

      for (let j = 1; j < cleanLine.length - 1; j++) {
        const char = cleanLine[j];

        if (!inString && char === "'") {
          inString = true;
          continue;
        }

        if (inString && char === "'") {
          if (cleanLine[j + 1] === "'") {
            current += "'";
            j++;
            continue;
          }
          inString = false;
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

      const obj = {};
      const colsToSkip = skipColumns[tableName] || [];

      columns.forEach((col, idx) => {
        if (colsToSkip.includes(col)) return;

        let val = values[idx];
        if (val === undefined || val === 'NULL' || val === 'null') {
          obj[col] = null;
        } else if (val?.toLowerCase() === 'true') {
          obj[col] = true;
        } else if (val?.toLowerCase() === 'false') {
          obj[col] = false;
        } else if (!isNaN(val) && val !== '' && !val?.includes('-')) {
          obj[col] = Number(val);
        } else if (val?.startsWith("'") && val?.endsWith("'")) {
          obj[col] = val.slice(1, -1).replace(/''/g, "'");
        } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
          obj[col] = val;
        } else {
          obj[col] = val;
        }
      });
      currentValues.push(obj);
    }

    if (inInsert && (line.endsWith(';') || (line === '' && currentValues.length > 0))) {
      if (currentValues.length > 0) {
        results.push({ table: tableName, rows: currentValues });
        currentValues = [];
      }
      inInsert = false;
    }
  }

  if (currentValues.length > 0) {
    results.push({ table: tableName, rows: currentValues });
  }

  return results;
}

async function batchInsert(table, rows, attempt = 1) {
  try {
    const conflictColumn = table === 'products' ? 'sku' : 'id';

    const { data, error } = await supabase
      .from(table)
      .upsert(rows, {
        onConflict: conflictColumn,
        ignoreDuplicates: true
      })
      .select();

    if (error) {
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

async function executeSqlFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);

  console.log(`\n[${filename}]`);
  console.log(`  Size: ${sizeKB} KB`);

  const inserts = parseInsertStatements(sql);

  if (inserts.length === 0) {
    console.log(`  No INSERTs found`);
    return { success: true };
  }

  console.log(`  Found ${inserts.length} INSERT statement(s)`);

  for (const insert of inserts) {
    const { table, rows } = insert;
    console.log(`  Table: ${table}, Rows: ${rows.length}`);

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
      } else {
        console.log(`FAILED: ${result.error}`);
        return { success: false };
      }

      if (i < batches.length - 1) {
        await sleep(100);
      }
    }
  }

  console.log(`  Completed`);
  return { success: true };
}

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

async function runMigration() {
  console.log('='.repeat(60));
  console.log('Supabase Migration Final');
  console.log('='.repeat(60));

  console.log('\n[Testing connection...]');
  try {
    await supabase.from('products').select('id').limit(1);
    console.log('Connection: OK');
  } catch (error) {
    console.log(`Connection failed: ${error.message}`);
    process.exit(1);
  }

  const migrationFiles = [
    'part_005_part001.sql',
    'part_005_part002.sql',
    'part_006_part001.sql',
    'part_006_part002.sql',
  ];

  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const result = await executeSqlFile(file);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
      console.log(`\nMigration stopped due to error in ${file}`);
      break;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  await verifyMigration();

  if (failCount > 0) {
    process.exit(1);
  }
}

runMigration().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
