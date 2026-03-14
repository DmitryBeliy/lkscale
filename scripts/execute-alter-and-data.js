#!/usr/bin/env node
/**
 * Execute ALTER TABLE and load data via Supabase REST API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
};

const PROJECT_ID = 'onnncepenxxxfprqaodu';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

/**
 * Execute SQL via Supabase REST API using exec_sql RPC
 */
function execSql(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ sql });
    
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: data || '{}' });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Execute ALTER TABLE statements
 */
async function executeAlterTable() {
  log.step('Executing ALTER TABLE for order_items');
  
  const alterStatements = `
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;
  `.trim();

  log.info('Adding columns: product_sku, unit_price, total_price, cost_price, notes');
  
  const result = await execSql(alterStatements);
  
  if (result.success) {
    log.success('ALTER TABLE completed successfully');
    return true;
  } else {
    log.error(`ALTER TABLE failed: ${result.error}`);
    return false;
  }
}

/**
 * Split INSERT statements into batches
 */
function splitInsertBatches(sql, batchSize = 500) {
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

      if (currentBatch.length >= batchSize) {
        const valuesClause = currentBatch.join(',\n');
        batches.push(`INSERT INTO ${tableName} (${columns}) VALUES ${valuesClause};`);
        currentBatch = [];
      }
    }

    if (inInsert && line.endsWith(';')) {
      if (currentBatch.length > 0) {
        const valuesClause = currentBatch.join(',\n');
        batches.push(`INSERT INTO ${tableName} (${columns}) VALUES ${valuesClause};`);
      }
      inInsert = false;
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    const valuesClause = currentBatch.join(',\n');
    batches.push(`INSERT INTO ${tableName} (${columns}) VALUES ${valuesClause};`);
  }

  return { tableName, batches };
}

/**
 * Execute INSERT file in batches
 */
async function executeInsertFile(filename) {
  const filepath = path.join(__dirname, '..', 'supabase', 'migrations', 'ready', filename);
  
  if (!fs.existsSync(filepath)) {
    log.error(`File not found: ${filepath}`);
    return false;
  }

  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);
  
  log.step(`Processing ${filename} (${sizeKB} KB)`);
  
  const { tableName, batches } = splitInsertBatches(sql, 300);
  
  if (batches.length === 0) {
    log.warn('No INSERT statements found');
    return false;
  }

  log.info(`Table: ${tableName}, Batches: ${batches.length}`);
  
  let successCount = 0;
  
  for (let i = 0; i < batches.length; i++) {
    process.stdout.write(`${colors.gray}  Batch ${i + 1}/${batches.length}...${colors.reset}\r`);
    
    const result = await execSql(batches[i]);
    
    if (result.success) {
      successCount++;
    } else {
      console.log(); // new line
      log.error(`Batch ${i + 1} failed: ${result.error}`);
      // Continue with next batch
    }
  }
  
  console.log(); // new line
  log.success(`Completed ${successCount}/${batches.length} batches for ${tableName}`);
  
  return successCount === batches.length;
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  log.step('Verifying migration results');
  
  const tables = ['orders', 'order_items', 'inventory_transactions'];
  
  for (const table of tables) {
    const result = await execSql(`SELECT COUNT(*) as count FROM ${table};`);
    if (result.success) {
      log.success(`${table}: data accessible`);
    } else {
      log.warn(`${table}: ${result.error}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  log.step('Starting migration execution');
  log.info(`Project: ${PROJECT_ID}`);
  
  // Step 1: Execute ALTER TABLE
  const alterSuccess = await executeAlterTable();
  
  if (!alterSuccess) {
    log.error('ALTER TABLE failed. Cannot proceed with data loading.');
    log.info('Please execute the following SQL manually in Supabase SQL Editor:');
    console.log('\n--- Copy and execute in SQL Editor ---');
    console.log(`
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;
    `.trim());
    console.log('--- End of SQL ---\n');
    process.exit(1);
  }
  
  // Step 2: Load order_items data (part_005 files)
  await executeInsertFile('part_005_part001.sql');
  await executeInsertFile('part_005_part002.sql');
  
  // Step 3: Load inventory_transactions data (part_006 files)
  await executeInsertFile('part_006_part001.sql');
  await executeInsertFile('part_006_part002.sql');
  
  // Step 4: Verify
  await verifyMigration();
  
  log.step('Migration execution completed');
}

main().catch(err => {
  log.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
