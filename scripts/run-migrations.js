#!/usr/bin/env node

/**
 * Database Migration Script
 * Executes SQL migrations on Supabase PostgreSQL database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
};

async function runMigrations() {
  log.step('Database Migration Started');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    log.error('Missing environment variables:');
    log.error('  - EXPO_PUBLIC_SUPABASE_URL');
    log.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const migrationsDir = path.join(__dirname, '..', 'docs', 'base', 'migration_sql');
  const migrationFiles = [
    '01_categories.sql',
    '02_suppliers.sql',
    '03_products.sql',
    '04_orders.sql',
    '05_order_items.sql',
    '06_inventory_transactions.sql',
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    if (!fs.existsSync(filePath)) {
      log.warn(`Migration file not found: ${file}`);
      continue;
    }

    log.step(`Running migration: ${file}`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute SQL using Supabase REST API
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        log.error(`Migration failed: ${error.message}`);
        continue;
      }
      
      log.success(`Migration completed: ${file}`);
    } catch (err) {
      log.error(`Error running migration ${file}: ${err.message}`);
    }
  }

  log.step('Migration process completed');
}

runMigrations().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
