#!/usr/bin/env node

/**
 * Apply SQL Migration to Supabase
 * Uses Supabase REST API to execute SQL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

async function applyMigration() {
  log.step('Supabase Migration Tool');
  
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://csjvvyjpqpchkpaqoufr.supabase.co';
  
  log.info(`Supabase URL: ${supabaseUrl}`);
  log.warn('You need to provide Service Role Key to execute migrations.');
  log.info('Get it from: Supabase Dashboard → Project Settings → API → service_role key\n');
  
  const serviceRoleKey = await new Promise((resolve) => {
    rl.question('Enter Service Role Key: ', (answer) => {
      resolve(answer.trim());
    });
  });
  
  if (!serviceRoleKey || serviceRoleKey.length < 20) {
    log.error('Invalid Service Role Key provided');
    rl.close();
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  // Find latest migration file
  const migrationDir = path.join(__dirname, '..', 'docs', 'base', 'migration_sql');
  const files = fs.readdirSync(migrationDir)
    .filter(f => f.startsWith('migration_') && f.endsWith('.sql'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    log.error('No migration files found');
    rl.close();
    process.exit(1);
  }
  
  const latestMigration = files[0];
  const migrationPath = path.join(migrationDir, latestMigration);
  
  log.info(`Found migration: ${latestMigration}`);
  
  const confirm = await new Promise((resolve) => {
    rl.question(`\nApply this migration? (yes/no): `, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
  
  if (confirm !== 'yes') {
    log.info('Migration cancelled');
    rl.close();
    process.exit(0);
  }
  
  log.step('Reading migration file...');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  log.info(`SQL size: ${(sql.length / 1024).toFixed(2)} KB`);
  
  log.step('Executing migration...');
  
  try {
    // Try to execute via RPC function
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      if (error.message.includes('Could not find the function')) {
        log.warn('exec_sql RPC function not found');
        log.info('Creating exec_sql function...');
        
        // Create the function first
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION exec_sql(query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE query;
          END;
          $$;
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { query: createFunctionSQL });
        
        if (createError && !createError.message.includes('already exists')) {
          log.error(`Cannot create exec_sql function: ${createError.message}`);
          log.info('\nAlternative: Apply migration manually via Supabase Dashboard:');
          log.info(`1. Open ${supabaseUrl}/project/_/sql/new`);
          log.info(`2. Copy contents of: ${migrationPath}`);
          log.info('3. Execute SQL');
          rl.close();
          process.exit(1);
        }
        
        // Retry migration
        const { error: retryError } = await supabase.rpc('exec_sql', { query: sql });
        if (retryError) {
          throw retryError;
        }
      } else {
        throw error;
      }
    }
    
    log.success('Migration applied successfully!');
    
  } catch (err) {
    log.error(`Migration failed: ${err.message}`);
    log.info('\nApply manually via Supabase Dashboard:');
    log.info(`1. Open ${supabaseUrl}/project/_/sql/new`);
    log.info(`2. Copy contents of: ${migrationPath}`);
    log.info('3. Execute SQL');
  }
  
  rl.close();
}

applyMigration().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  rl.close();
  process.exit(1);
});
