#!/usr/bin/env node

/**
 * Execute SQL Migration to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
};

async function executeMigration() {
  const supabaseUrl = 'https://onnncepenxxxfpnqaodu.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

  log.step('Starting Database Migration');
  log.info(`Supabase URL: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find migration file
  const migrationFile = path.join(__dirname, '..', 'docs', 'base', 'migration_sql', 'migration_complete.sql');
  
  if (!fs.existsSync(migrationFile)) {
    log.error(`Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  log.info(`Loading migration: migration_complete.sql`);
  const sql = fs.readFileSync(migrationFile, 'utf8');
  log.info(`SQL size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

  // Split SQL into batches (to avoid timeout)
  const batches = sql.split(';').filter(s => s.trim().length > 0);
  log.info(`Total statements: ${batches.length}`);

  log.step('Executing migration...');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const statement = batches[i].trim() + ';';
    
    try {
      // Execute via RPC
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      
      if (error) {
        // Try alternative: use SQL API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ query: statement })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      }
      
      successCount++;
      if ((i + 1) % 100 === 0) {
        log.info(`Progress: ${i + 1}/${batches.length} statements`);
      }
    } catch (err) {
      errorCount++;
      log.error(`Statement ${i + 1} failed: ${err.message}`);
    }
  }

  log.step('Migration completed');
  log.success(`Successful: ${successCount}`);
  if (errorCount > 0) {
    log.warn(`Failed: ${errorCount}`);
  }

  // Verify migration
  log.step('Verifying migration...');
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    log.warn('Could not verify: ' + error.message);
  } else {
    log.success(`Tables created: ${tables.length}`);
    tables.slice(0, 10).forEach(t => log.info(`  - ${t.table_name}`));
  }
}

executeMigration().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
