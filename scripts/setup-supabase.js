#!/usr/bin/env node

/**
 * Lkscale Supabase Setup Script
 * 
 * This script automates the setup of Supabase for the Lkscale ERP system.
 * It creates tables, applies RLS policies, and seeds test data.
 * 
 * Usage:
 *   node scripts/setup-supabase.js
 *   node scripts/setup-supabase.js --env=production
 *   node scripts/setup-supabase.js --skip-seed
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file
 *   - Node.js 18+
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Logger
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
  divider: () => console.log(`${colors.gray}${'─'.repeat(60)}${colors.reset}`),
};

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    acc[key] = value || true;
  }
  return acc;
}, {});

// Configuration
const CONFIG = {
  env: args.env || 'development',
  skipSeed: args['skip-seed'] || false,
  skipSchema: args['skip-schema'] || false,
  force: args.force || false,
};

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    log.warn('.env file not found, copying from .env.example');
    fs.copyFileSync(envExamplePath, envPath);
  }
  
  require('dotenv').config({ path: envPath });
  
  return {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

// Validate environment
function validateEnv(env) {
  const errors = [];
  
  if (!env.url) {
    errors.push('SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!env.serviceRoleKey && !env.anonKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  }
  
  if (errors.length > 0) {
    log.error('Missing required environment variables:');
    errors.forEach(e => console.log(`  ${colors.red}•${colors.reset} ${e}`));
    console.log(`\n${colors.yellow}Please check your .env file${colors.reset}`);
    process.exit(1);
  }
  
  return true;
}

// Execute SQL query via Supabase REST API
async function executeSql(url, key, sql, description) {
  const endpoint = `${url}/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'apikey': key,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Alternative: Execute SQL via direct database connection (using pg)
async function executeSqlDirect(sql, description) {
  try {
    // Try to use pg if available
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
    });
    
    await client.connect();
    const result = await client.query(sql);
    await client.end();
    
    return { success: true, data: result };
  } catch (error) {
    // pg not available, try SQL file execution
    return { 
      success: false, 
      error: `Direct SQL execution failed: ${error.message}\nConsider using Supabase Dashboard SQL Editor instead.` 
    };
  }
}

// Read SQL file
function readSqlFile(filename) {
  const filePath = path.resolve(process.cwd(), 'supabase', filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  
  return fs.readFileSync(filePath, 'utf-8');
}

// Split SQL into statements
function splitSqlStatements(sql) {
  // Simple splitting by semicolons, handling basic cases
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
    .map(s => s + ';');
}

// Confirm action with user
async function confirm(message) {
  if (CONFIG.force) return true;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}? ${colors.reset}${message} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Setup auth users (manual instructions)
function printAuthSetupInstructions() {
  log.step('Auth Users Setup');
  log.info('Please create the following users in Supabase Auth Dashboard:');
  log.divider();
  
  const users = [
    { email: 'owner@technotorg.ru', password: 'Demo123!', role: 'owner' },
    { email: 'admin@technotorg.ru', password: 'Demo123!', role: 'admin' },
    { email: 'manager@technotorg.ru', password: 'Demo123!', role: 'manager' },
    { email: 'cashier@technotorg.ru', password: 'Demo123!', role: 'cashier' },
    { email: 'viewer@technotorg.ru', password: 'Demo123!', role: 'viewer' },
  ];
  
  users.forEach((user, i) => {
    console.log(`  ${i + 1}. ${colors.cyan}${user.email}${colors.reset}`);
    console.log(`     Password: ${colors.gray}${user.password}${colors.reset}`);
    console.log(`     Role: ${colors.gray}${user.role}${colors.reset}`);
    console.log();
  });
  
  log.info('Steps:');
  console.log('  1. Go to Supabase Dashboard → Authentication → Users');
  console.log('  2. Click "Add user" → "Create new user"');
  console.log('  3. Enter email and password from above');
  console.log('  4. Repeat for all users');
  console.log('  5. Run seed.sql again after creating users');
  
  log.divider();
}

// Check if tables exist
async function checkExistingTables(env) {
  log.step('Checking existing tables');
  
  const checkSql = `
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('companies', 'profiles', 'products', 'orders');
  `;
  
  const result = await executeSql(env.url, env.serviceRoleKey || env.anonKey, checkSql);
  
  if (result.success && result.data && result.data[0]?.count > 0) {
    const count = result.data[0].count;
    log.warn(`Found ${count} existing tables`);
    
    const proceed = await confirm('Tables already exist. Do you want to continue? This may fail if tables conflict.');
    if (!proceed) {
      log.info('Setup cancelled');
      process.exit(0);
    }
  } else {
    log.success('No existing tables found, ready to setup');
  }
}

// Apply schema
async function applySchema(env) {
  if (CONFIG.skipSchema) {
    log.step('Skipping schema (as requested)');
    return;
  }
  
  log.step('Applying database schema');
  
  try {
    const schema = readSqlFile('schema.sql');
    
    log.info('Loading schema.sql...');
    log.info(`Schema size: ${(schema.length / 1024).toFixed(2)} KB`);
    
    // Try to execute via Supabase
    const result = await executeSql(env.url, env.serviceRoleKey || env.anonKey, schema, 'Schema');
    
    if (result.success) {
      log.success('Schema applied successfully');
    } else {
      log.error(`Failed to apply schema: ${result.error}`);
      log.info('Trying alternative method...');
      
      // Try direct execution
      const directResult = await executeSqlDirect(schema, 'Schema');
      if (directResult.success) {
        log.success('Schema applied via direct connection');
      } else {
        throw new Error(directResult.error);
      }
    }
  } catch (error) {
    log.error(`Schema application failed: ${error.message}`);
    log.info('\nAlternative: Apply schema manually via Supabase SQL Editor');
    console.log(`  1. Open ${colors.cyan}${env.url}${colors.reset}`);
    console.log('  2. Go to SQL Editor');
    console.log('  3. Copy contents of supabase/schema.sql');
    console.log('  4. Run the SQL');
    throw error;
  }
}

// Apply seed data
async function applySeed(env) {
  if (CONFIG.skipSeed) {
    log.step('Skipping seed data (as requested)');
    return;
  }
  
  log.step('Applying seed data');
  
  try {
    const seed = readSqlFile('seed.sql');
    
    log.info('Loading seed.sql...');
    log.info(`Seed size: ${(seed.length / 1024).toFixed(2)} KB`);
    
    const result = await executeSql(env.url, env.serviceRoleKey || env.anonKey, seed, 'Seed');
    
    if (result.success) {
      log.success('Seed data applied successfully');
    } else {
      log.warn(`Seed application warning: ${result.error}`);
      log.info('This may be expected if auth users are not yet created');
    }
  } catch (error) {
    log.warn(`Seed application issue: ${error.message}`);
    log.info('You can apply seed data later via Supabase SQL Editor');
  }
}

// Verify setup
async function verifySetup(env) {
  log.step('Verifying setup');
  
  const checks = [
    { name: 'companies', sql: 'SELECT COUNT(*) FROM companies' },
    { name: 'profiles', sql: 'SELECT COUNT(*) FROM profiles' },
    { name: 'products', sql: 'SELECT COUNT(*) FROM products' },
    { name: 'customers', sql: 'SELECT COUNT(*) FROM customers' },
    { name: 'orders', sql: 'SELECT COUNT(*) FROM orders' },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const result = await executeSql(env.url, env.serviceRoleKey || env.anonKey, check.sql);
    
    if (result.success) {
      const count = result.data?.[0]?.count || 0;
      log.success(`${check.name}: ${count} rows`);
    } else {
      log.error(`${check.name}: Failed to query`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Update .env.example
function updateEnvExample(env) {
  log.step('Updating environment files');
  
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (fs.existsSync(envExamplePath)) {
    let content = fs.readFileSync(envExamplePath, 'utf-8');
    
    // Update placeholders with actual values if available
    if (env.url) {
      content = content.replace(
        /SUPABASE_URL=.*/,
        `SUPABASE_URL=${env.url}`
      );
      content = content.replace(
        /EXPO_PUBLIC_SUPABASE_URL=.*/,
        `EXPO_PUBLIC_SUPABASE_URL=${env.url}`
      );
    }
    
    if (env.anonKey) {
      content = content.replace(
        /SUPABASE_ANON_KEY=.*/,
        `SUPABASE_ANON_KEY=${env.anonKey}`
      );
      content = content.replace(
        /EXPO_PUBLIC_SUPABASE_ANON_KEY=.*/,
        `EXPO_PUBLIC_SUPABASE_ANON_KEY=${env.anonKey}`
      );
    }
    
    fs.writeFileSync(envPath, content);
    log.success('.env file updated with Supabase credentials');
  }
}

// Print summary
function printSummary(env) {
  log.divider();
  console.log(`\n${colors.bright}${colors.green}✓ Supabase Setup Complete!${colors.reset}\n`);
  
  log.info('Next steps:');
  console.log('  1. Create auth users (see instructions above)');
  console.log('  2. Configure storage buckets in Supabase Dashboard');
  console.log('  3. Test the connection with: npm run dev');
  console.log('  4. Review RLS policies in Supabase Dashboard');
  
  console.log(`\n${colors.gray}Dashboard: ${colors.cyan}${env.url.replace('.co', '.co/project/project-id')}${colors.reset}`);
  console.log(`${colors.gray}API Docs:  ${colors.cyan}${env.url}/rest/v1/${colors.reset}\n`);
  
  log.divider();
}

// Main function
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗`);
  console.log(`║          Lkscale Supabase Setup                            ║`);
  console.log(`║          Environment: ${CONFIG.env.padEnd(25)}║`);
  console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    // Load environment
    const env = loadEnv();
    validateEnv(env);
    
    log.info(`Supabase URL: ${env.url}`);
    log.info(`Auth method: ${env.serviceRoleKey ? 'Service Role Key' : 'Anon Key'}`);
    
    // Confirm if production
    if (CONFIG.env === 'production' && !CONFIG.force) {
      const confirmed = await confirm(
        `${colors.red}WARNING:${colors.reset} You are about to modify PRODUCTION database. Continue?`
      );
      if (!confirmed) {
        log.info('Setup cancelled');
        process.exit(0);
      }
    }
    
    // Check existing tables
    await checkExistingTables(env);
    
    // Apply schema
    await applySchema(env);
    
    // Apply seed
    await applySeed(env);
    
    // Print auth setup instructions
    printAuthSetupInstructions();
    
    // Verify setup
    const verified = await verifySetup(env);
    
    if (verified) {
      log.success('All checks passed!');
    } else {
      log.warn('Some checks failed, but setup may still be usable');
    }
    
    // Update environment files
    updateEnvExample(env);
    
    // Print summary
    printSummary(env);
    
  } catch (error) {
    console.error(`\n${colors.red}✗ Setup failed:${colors.reset}`, error.message);
    
    if (args.verbose) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run main
main();
