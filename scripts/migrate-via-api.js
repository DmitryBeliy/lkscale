#!/usr/bin/env node

/**
 * Execute migrations using Supabase Management API
 * This script uses the Supabase Management API to execute SQL
 * Requires SUPABASE_ACCESS_TOKEN with appropriate permissions
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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
const PROJECT_REF = 'onnncepenxxxfprqaodu';

// Migration files in execution order
const MIGRATION_FILES = [
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

/**
 * Make HTTPS request to Management API
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsed,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Execute SQL query via Management API
 */
async function executeSql(accessToken, sql) {
  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  const postData = JSON.stringify({ query: sql });

  try {
    const response = await makeRequest(options, postData);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return { success: true, data: response.data };
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}` 
      };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Execute SQL via direct PostgreSQL connection (if pgBouncer is available)
 */
async function executeSqlDirect(sql, serviceRoleKey) {
  const options = {
    hostname: `db.${PROJECT_REF}.supabase.co`,
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
  };

  const postData = JSON.stringify({ query: sql });

  try {
    const response = await makeRequest(options, postData);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return { success: true, data: response.data };
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}` 
      };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Execute a migration file
 */
async function executeMigrationFile(filePath, fileName, accessToken) {
  log.step(`Executing: ${fileName}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const sizeKB = (sql.length / 1024).toFixed(2);
    log.info(`File size: ${sizeKB} KB`);
    
    // Management API has limit of ~500KB per request
    const MAX_SIZE = 450 * 1024;
    
    if (sql.length > MAX_SIZE) {
      log.warn('File is large, splitting into chunks...');
      return await executeInChunks(sql, accessToken, fileName);
    }
    
    const result = await executeSql(accessToken, sql);
    
    if (result.success) {
      log.success(`Completed: ${fileName}`);
      return true;
    } else {
      log.error(`Failed: ${fileName}`);
      log.error(result.error);
      return false;
    }
  } catch (err) {
    log.error(`Error reading ${fileName}: ${err.message}`);
    return false;
  }
}

/**
 * Execute SQL in chunks
 */
async function executeInChunks(sql, accessToken, fileName) {
  // Split by statement terminators, being careful with functions
  const statements = [];
  let current = '';
  let inFunction = false;
  
  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments
    if (trimmed.startsWith('--')) continue;
    
    // Track function boundaries
    if (trimmed.toUpperCase().includes('CREATE OR REPLACE FUNCTION') ||
        trimmed.toUpperCase().includes('CREATE FUNCTION')) {
      inFunction = true;
    }
    
    current += line + '\n';
    
    // End of function or statement
    if (inFunction && trimmed === '$$;') {
      inFunction = false;
      statements.push(current);
      current = '';
    } else if (!inFunction && trimmed.endsWith(';')) {
      statements.push(current);
      current = '';
    }
  }
  
  if (current.trim()) {
    statements.push(current);
  }
  
  let chunk = '';
  let chunkCount = 0;
  let successCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    if ((chunk.length + stmt.length) > 400000) {
      // Execute current chunk
      chunkCount++;
      log.info(`Executing chunk ${chunkCount}...`);
      
      const result = await executeSql(accessToken, chunk);
      if (result.success) {
        successCount++;
      } else {
        log.error(`Chunk ${chunkCount} failed: ${result.error}`);
      }
      
      chunk = stmt;
    } else {
      chunk += stmt;
    }
  }
  
  // Execute remaining
  if (chunk.trim()) {
    chunkCount++;
    log.info(`Executing chunk ${chunkCount}...`);
    
    const result = await executeSql(accessToken, chunk);
    if (result.success) {
      successCount++;
    } else {
      log.error(`Chunk ${chunkCount} failed: ${result.error}`);
    }
  }
  
  if (successCount === chunkCount) {
    log.success(`Completed: ${fileName} (${chunkCount} chunks)`);
    return true;
  } else {
    log.error(`Failed: ${fileName} (${successCount}/${chunkCount} chunks)`);
    return false;
  }
}

/**
 * Verify migration results
 */
async function runVerification(accessToken) {
  log.step('Running verification queries...');
  
  const queries = [
    { name: 'Products', sql: 'SELECT COUNT(*) as count FROM products' },
    { name: 'Orders', sql: 'SELECT COUNT(*) as count FROM orders' },
    { name: 'Order Items', sql: 'SELECT COUNT(*) as count FROM order_items' },
    { name: 'Categories', sql: 'SELECT COUNT(*) as count FROM categories' },
    { name: 'Suppliers', sql: 'SELECT COUNT(*) as count FROM suppliers' },
    { name: 'Manufacturers', sql: 'SELECT COUNT(*) as count FROM manufacturers' },
    { name: 'Inventory Transactions', sql: 'SELECT COUNT(*) as count FROM inventory_transactions' },
  ];
  
  for (const { name, sql } of queries) {
    try {
      const result = await executeSql(accessToken, sql);
      
      if (result.success) {
        const count = result.data?.[0]?.count || result.data?.count || 0;
        log.info(`${name}: ${count} records`);
      } else {
        log.warn(`Could not get count for ${name}`);
      }
    } catch (err) {
      log.warn(`Error checking ${name}: ${err.message}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  log.step('Supabase Migration via Management API');
  log.info(`Project ID: ${PROJECT_ID}`);
  
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    log.error('SUPABASE_ACCESS_TOKEN is not set!');
    log.info('');
    log.info('To get an access token:');
    log.info('1. Go to https://app.supabase.com/account/tokens');
    log.info('2. Click "Generate new token"');
    log.info('3. Copy the token and set it as environment variable:');
    log.info('');
    log.info('   Windows PowerShell:');
    log.info('   $env:SUPABASE_ACCESS_TOKEN="your_token_here"');
    log.info('');
    log.info('   Windows CMD:');
    log.info('   set SUPABASE_ACCESS_TOKEN=your_token_here');
    log.info('');
    log.info('   Or create a .env file with:');
    log.info('   SUPABASE_ACCESS_TOKEN=your_token_here');
    log.info('');
    process.exit(1);
  }
  
  // Check API access
  log.info('Checking API access...');
  try {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      log.success(`Connected to project: ${response.data.name || PROJECT_ID}`);
    } else if (response.statusCode === 401) {
      log.error('Invalid access token or insufficient permissions');
      process.exit(1);
    } else {
      log.warn(`Unexpected response: HTTP ${response.statusCode}`);
    }
  } catch (err) {
    log.error(`Connection failed: ${err.message}`);
    process.exit(1);
  }
  
  // Execute migrations
  const readyDir = path.join(__dirname, '..', 'supabase', 'migrations', 'ready');
  let successCount = 0;
  let failCount = 0;
  
  for (const fileName of MIGRATION_FILES) {
    const filePath = path.join(readyDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      log.warn(`File not found: ${fileName}`);
      continue;
    }
    
    const success = await executeMigrationFile(filePath, fileName, accessToken);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      log.error(`Stopping migration due to failure`);
      break;
    }
    
    // Small delay between files to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log.step('Migration Summary');
  log.info(`Successful: ${successCount}/${MIGRATION_FILES.length}`);
  log.info(`Failed: ${failCount}/${MIGRATION_FILES.length}`);
  
  if (successCount > 0) {
    await runVerification(accessToken);
  }
  
  if (failCount > 0) {
    process.exit(1);
  }
  
  log.success('All migrations completed successfully!');
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    log.error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
