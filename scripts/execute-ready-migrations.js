#!/usr/bin/env node

/**
 * Execute Ready Migrations to Supabase
 * Executes SQL migration files from supabase/migrations/ready/
 * Uses Supabase Management API or direct PostgreSQL connection
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
  progress: (msg) => process.stdout.write(`${colors.gray}${msg}${colors.reset}\r`),
};

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

const PROJECT_ID = 'onnncepenxxxfprqaodu';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

/**
 * Execute SQL via Supabase REST API using pg_rpc
 */
async function executeSQL(supabaseClient, sql) {
  try {
    // Try using exec_sql RPC function
    const { data, error } = await supabaseClient.rpc('exec_sql', { query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct REST API
      return await executeViaRestAPI(sql);
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Execute SQL via Supabase REST API directly
 */
async function executeViaRestAPI(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: JSON.parse(data || '{}') });
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
 * Check if exec_sql function exists
 */
async function checkExecSqlFunction(supabaseClient) {
  try {
    const { data, error } = await supabaseClient
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'exec_sql')
      .single();
    
    return !error && data;
  } catch {
    return false;
  }
}

/**
 * Create exec_sql function if it doesn't exist
 */
async function createExecSqlFunction(supabaseClient) {
  const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

  try {
    // Try to create using direct SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        'Prefer': 'tx=commit',
      },
      body: JSON.stringify({ query: createFunctionSQL }),
    });
    
    return response.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Execute a single migration file
 */
async function executeMigrationFile(filePath, fileName, supabaseClient) {
  log.step(`Executing: ${fileName}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const sizeKB = (sql.length / 1024).toFixed(2);
    log.info(`File size: ${sizeKB} KB`);
    
    // Split large SQL files into chunks if needed
    const MAX_CHUNK_SIZE = 500 * 1024; // 500KB max per request
    
    if (sql.length > MAX_CHUNK_SIZE) {
      log.warn('File is large, splitting into chunks...');
      return await executeInChunks(sql, supabaseClient, fileName);
    }
    
    const result = await executeSQL(supabaseClient, sql);
    
    if (result.success) {
      log.success(`Completed: ${fileName}`);
      return true;
    } else {
      log.error(`Failed: ${fileName} - ${result.error}`);
      return false;
    }
  } catch (err) {
    log.error(`Error reading ${fileName}: ${err.message}`);
    return false;
  }
}

/**
 * Execute SQL in chunks for large files
 */
async function executeInChunks(sql, supabaseClient, fileName) {
  // Split by semicolon, keeping statements intact
  const statements = sql.split(/;\s*$/m).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let chunkCount = 0;
  let successCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    
    const statementWithSemicolon = stmt + ';\n';
    
    if ((currentChunk.length + statementWithSemicolon.length) > 450000) {
      // Execute current chunk
      chunkCount++;
      log.progress(`Chunk ${chunkCount}...`);
      
      const result = await executeSQL(supabaseClient, currentChunk);
      if (result.success) {
        successCount++;
      } else {
        log.error(`Chunk ${chunkCount} failed: ${result.error}`);
      }
      
      currentChunk = statementWithSemicolon;
    } else {
      currentChunk += statementWithSemicolon;
    }
  }
  
  // Execute remaining chunk
  if (currentChunk.trim()) {
    chunkCount++;
    log.progress(`Chunk ${chunkCount}...`);
    
    const result = await executeSQL(supabaseClient, currentChunk);
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
    log.error(`Failed: ${fileName} (${successCount}/${chunkCount} chunks succeeded)`);
    return false;
  }
}

/**
 * Run verification queries
 */
async function runVerification(supabaseClient) {
  log.step('Running verification queries...');
  
  const queries = [
    { name: 'Products', query: 'SELECT COUNT(*) as count FROM products' },
    { name: 'Orders', query: 'SELECT COUNT(*) as count FROM orders' },
    { name: 'Order Items', query: 'SELECT COUNT(*) as count FROM order_items' },
    { name: 'Categories', query: 'SELECT COUNT(*) as count FROM categories' },
    { name: 'Suppliers', query: 'SELECT COUNT(*) as count FROM suppliers' },
  ];
  
  for (const { name, query } of queries) {
    try {
      const { data, error } = await supabaseClient.rpc('exec_sql', { query });
      
      if (error) {
        // Try direct query
        const result = await supabaseClient.from('products').select('*', { count: 'exact', head: true });
        log.info(`${name}: ${result.count || 0} records`);
      } else {
        log.info(`${name}: ${data?.[0]?.count || 0} records`);
      }
    } catch (err) {
      log.warn(`Could not get count for ${name}: ${err.message}`);
    }
  }
}

/**
 * Main migration function
 */
async function runMigrations() {
  log.step('Supabase Migration Tool');
  log.info(`Project ID: ${PROJECT_ID}`);
  log.info(`URL: ${SUPABASE_URL}`);
  
  // Check environment variables
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!serviceRoleKey) {
    log.error('SUPABASE_SERVICE_ROLE_KEY is not set!');
    log.info('Get it from: Supabase Dashboard → Project Settings → API → service_role key');
    process.exit(1);
  }
  
  if (!anonKey) {
    log.warn('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set, trying with service role key only');
  }
  
  // Import Supabase client dynamically
  let createClient;
  try {
    const supabase = require('@supabase/supabase-js');
    createClient = supabase.createClient;
  } catch (err) {
    log.error('@supabase/supabase-js is not installed');
    log.info('Install it with: npm install @supabase/supabase-js');
    process.exit(1);
  }
  
  const supabaseClient = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  // Check connection
  log.info('Checking connection...');
  try {
    const { error } = await supabaseClient.from('information_schema.tables').select('table_name').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    log.success('Connected to Supabase');
  } catch (err) {
    log.error(`Connection failed: ${err.message}`);
    process.exit(1);
  }
  
  // Execute migration files
  const readyDir = path.join(__dirname, '..', 'supabase', 'migrations', 'ready');
  let successCount = 0;
  let failCount = 0;
  
  for (const fileName of MIGRATION_FILES) {
    const filePath = path.join(readyDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      log.warn(`File not found: ${fileName}`);
      continue;
    }
    
    const success = await executeMigrationFile(filePath, fileName, supabaseClient);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      log.error(`Stopping migration due to failure in ${fileName}`);
      break;
    }
  }
  
  // Summary
  log.step('Migration Summary');
  log.info(`Successful: ${successCount}/${MIGRATION_FILES.length}`);
  log.info(`Failed: ${failCount}/${MIGRATION_FILES.length}`);
  
  if (successCount > 0) {
    // Run verification
    await runVerification(supabaseClient);
  }
  
  if (failCount > 0) {
    process.exit(1);
  }
  
  log.success('All migrations completed successfully!');
}

// Run if called directly
if (require.main === module) {
  runMigrations().catch((err) => {
    log.error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runMigrations };
