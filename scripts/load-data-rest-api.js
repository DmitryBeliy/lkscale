#!/usr/bin/env node
/**
 * Load data via Supabase REST API directly (POST /rest/v1/table)
 * Use after ALTER TABLE is executed manually in SQL Editor
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
 * Insert data via REST API
 */
function insertData(table, records) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(records);
    
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: `/rest/v1/${table}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'resolution=ignore-duplicates,return=minimal',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, count: records.length });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}`, count: 0 });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message, count: 0 });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Parse INSERT SQL and extract records
 */
function parseInsertSql(sql, tableName) {
  const records = [];
  const lines = sql.split('\n');
  let inValues = false;
  let columns = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Extract column names from INSERT statement
    if (trimmed.toUpperCase().startsWith('INSERT INTO')) {
      const colMatch = trimmed.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)/i);
      if (colMatch) {
        columns = colMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
      }
      continue;
    }
    
    // Skip VALUES line
    if (trimmed.toUpperCase().startsWith('VALUES')) {
      inValues = true;
      continue;
    }
    
    // Parse value rows
    if (trimmed.startsWith('(') && inValues) {
      // Remove parentheses and trailing comma/semicolon
      const cleanLine = trimmed.replace(/^\(/, '').replace(/\)[,;]?$/, '');
      
      // Split by comma but respect quoted strings
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
        
        // Handle NULL
        if (val.toUpperCase() === 'NULL') {
          record[col] = null;
        } else if (val.toUpperCase() === 'NOW()' || val.toUpperCase() === "'NOW()'") {
          record[col] = new Date().toISOString();
        } else if (!isNaN(val) && val !== '') {
          record[col] = Number(val);
        } else {
          record[col] = val;
        }
      }
      
      records.push(record);
    }
  }

  return { tableName, records };
}

/**
 * Load data from SQL file in batches
 */
async function loadSqlFile(filename) {
  const filepath = path.join(__dirname, '..', 'supabase', 'migrations', 'ready', filename);
  
  if (!fs.existsSync(filepath)) {
    log.error(`File not found: ${filepath}`);
    return { success: false, count: 0 };
  }

  const sql = fs.readFileSync(filepath, 'utf8');
  const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);
  
  log.step(`Processing ${filename} (${sizeKB} KB)`);
  
  const { tableName, records } = parseInsertSql(sql, filename);
  
  if (records.length === 0) {
    log.warn('No records found in file');
    return { success: false, count: 0 };
  }

  log.info(`Table: ${tableName}, Records: ${records.length}`);
  
  // Insert in batches of 100
  const BATCH_SIZE = 100;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(records.length / BATCH_SIZE);
    
    process.stdout.write(`${colors.gray}  Batch ${batchNum}/${totalBatches} (${batch.length} records)...${colors.reset}\r`);
    
    const result = await insertData(tableName, batch);
    
    if (result.success) {
      successCount += result.count;
    } else {
      failCount += batch.length;
      if (batchNum <= 3) {
        // Show error for first few batches
        console.log(); // new line
        log.warn(`Batch ${batchNum} error: ${result.error}`);
      }
    }
    
    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < records.length) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  console.log(); // new line
  log.success(`Inserted ${successCount}/${records.length} records into ${tableName}`);
  if (failCount > 0) {
    log.warn(`Failed to insert ${failCount} records`);
  }
  
  return { success: failCount === 0, count: successCount };
}

/**
 * Main execution
 */
async function main() {
  log.step('Loading data via REST API');
  log.info(`Project: ${PROJECT_ID}`);
  
  // Load order_items data
  const result1 = await loadSqlFile('part_006_part001.sql');
  const result2 = await loadSqlFile('part_006_part002.sql');
  
  log.step('Data loading completed');
  log.info(`Total records inserted: ${result1.count + result2.count}`);
}

main().catch(err => {
  log.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
