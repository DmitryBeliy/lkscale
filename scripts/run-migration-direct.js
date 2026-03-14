#!/usr/bin/env node
/**
 * Direct Migration Script via REST API
 * 
 * Steps:
 * 1. Check if exec_sql function exists
 * 2. If not, provide SQL to create it (must be run manually in SQL Editor)
 * 3. Execute ALTER TABLE via exec_sql
 * 4. Load data via REST API
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
};

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

// Check if exec_sql function exists
async function checkExecSqlFunction() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql: 'SELECT 1' }),
    });
    
    if (response.status === 404) {
      return { exists: false };
    }
    return { exists: response.ok || response.status !== 404 };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Execute SQL via exec_sql RPC
async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return { success: true };
}

// Insert data via REST API directly
async function insertData(table, records) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(records),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return { success: true, count: records.length };
}

// Parse INSERT SQL and extract records
function parseInsertSql(sql) {
  const records = [];
  const lines = sql.split('\n');
  let columns = [];
  let tableName = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Extract column names from INSERT statement
    if (trimmed.toUpperCase().startsWith('INSERT INTO')) {
      const tableMatch = trimmed.match(/INSERT INTO\s+(\w+)/i);
      if (tableMatch) tableName = tableMatch[1];
      
      const colMatch = trimmed.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
      if (colMatch) {
        columns = colMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
      }
      continue;
    }
    
    // Skip VALUES line
    if (trimmed.toUpperCase().startsWith('VALUES')) continue;
    
    // Parse value rows
    if (trimmed.startsWith('(')) {
      const cleanLine = trimmed.replace(/^\(/, '').replace(/\)[,;]?$/, '');
      
      // Parse values handling quoted strings
      const values = [];
      let current = '';
      let inQuote = false;
      let quoteChar = null;
      
      for (let i = 0; i < cleanLine.length; i++) {
        const char = cleanLine[i];
        
        if ((char === "'" || char === '"') && !inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar && inQuote) {
          inQuote = false;
          quoteChar = null;
        } else if (char === ',' && !inQuote) {
          values.push(current.trim());
          current = '';
          continue;
        }
        
        current += char;
      }
      values.push(current.trim());
      
      // Create record object
      const record = {};
      for (let i = 0; i < columns.length && i < values.length; i++) {
        const col = columns[i];
        let val = values[i].trim();
        
        // Remove quotes
        if ((val.startsWith("'") && val.endsWith("'")) || 
            (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        
        // Handle special values
        if (val.toUpperCase() === 'NULL') {
          record[col] = null;
        } else if (val.toUpperCase() === 'NOW()' || val === "'NOW()'") {
          record[col] = new Date().toISOString();
        } else if (!isNaN(val) && val !== '' && val.indexOf('.') === -1) {
          record[col] = parseInt(val);
        } else if (!isNaN(val) && val !== '') {
          record[col] = parseFloat(val);
        } else {
          record[col] = val;
        }
      }
      
      records.push(record);
    }
  }

  return { tableName, records };
}

// Load SQL file and insert data
async function loadSqlFile(filename, batchSize = 200) {
  const filepath = path.join(__dirname, '..', 'supabase', 'migrations', 'ready', filename);
  
  if (!fs.existsSync(filepath)) {
    log.warn(`File not found: ${filepath}`);
    return { success: false, count: 0 };
  }

  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);
  
  log.step(`Loading ${filename} (${sizeKB} KB)`);
  
  const { tableName, records } = parseInsertSql(sql);
  
  if (records.length === 0) {
    log.warn('No records found');
    return { success: false, count: 0 };
  }

  log.info(`Table: ${colors.blue}${tableName}${colors.reset}, Records: ${colors.blue}${records.length}${colors.reset}`);
  
  // Insert in batches
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(records.length / batchSize);
    
    process.stdout.write(`${colors.blue}  Batch ${batchNum}/${totalBatches}...${colors.reset}\r`);
    
    try {
      const result = await insertData(tableName, batch);
      successCount += result.count;
    } catch (error) {
      failCount += batch.length;
      if (batchNum <= 2) {
        console.log();
        log.warn(`Batch ${batchNum} error: ${error.message.substring(0, 100)}`);
      }
    }
    
    // Small delay to avoid rate limiting
    if (i + batchSize < records.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log();
  log.success(`Inserted ${successCount}/${records.length} records`);
  if (failCount > 0) {
    log.warn(`Failed: ${failCount} records`);
  }
  
  return { success: failCount === 0, count: successCount };
}

// Create exec_sql function SQL
function getCreateFunctionSql() {
  return `
-- Create exec_sql function for running migrations via REST API
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
`;
}

// Execute ALTER TABLE
async function executeAlterTable() {
  log.step('Executing ALTER TABLE for order_items');
  
  const alterSql = `
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;
  `.trim();

  try {
    await executeSql(alterSql);
    log.success('ALTER TABLE completed successfully');
    return true;
  } catch (error) {
    log.error(`ALTER TABLE failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log.step('Starting migration via REST API');
  log.info(`Project: ${SUPABASE_URL}`);
  
  // Check if exec_sql function exists
  const checkResult = await checkExecSqlFunction();
  
  if (!checkResult.exists) {
    log.warn('exec_sql function not found in database');
    log.info('Please run the following SQL in Supabase SQL Editor first:');
    console.log('\n' + colors.yellow + '--- COPY TO SQL EDITOR ---' + colors.reset);
    console.log(getCreateFunctionSql());
    console.log(colors.yellow + '--- END ---' + colors.reset + '\n');
    
    log.info('After creating the function, run this script again.');
    process.exit(1);
  }
  
  log.success('exec_sql function exists');
  
  // Step 1: Execute ALTER TABLE
  const alterSuccess = await executeAlterTable();
  if (!alterSuccess) {
    log.error('Cannot proceed without ALTER TABLE');
    process.exit(1);
  }
  
  // Step 2: Load data files
  log.step('Loading data files');
  
  const files = [
    'part_005_part001.sql',
    'part_005_part002.sql', 
    'part_006_part001.sql',
    'part_006_part002.sql'
  ];
  
  let totalRecords = 0;
  
  for (const file of files) {
    const result = await loadSqlFile(file);
    if (result.count > 0) {
      totalRecords += result.count;
    }
  }
  
  log.step('Migration completed');
  log.success(`Total records inserted: ${totalRecords}`);
}

main().catch(err => {
  log.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
