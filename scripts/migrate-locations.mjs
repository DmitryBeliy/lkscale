import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const DATA_DIR = path.join(__dirname, '../docs/base/extracted_data');

function generateUUID(id, prefix) {
  const hash = crypto.createHash('md5').update(`${prefix}:${id}`).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

async function migrateLocations() {
  console.log('🔄 Migrating locations...\n');
  
  const locations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dbo_Location.json'), 'utf8'));
  console.log(`Found ${locations.length} locations`);
  
  // Clear existing data first
  const { error: clearError } = await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (clearError) console.log(`Note: ${clearError.message}`);
  
  let success = 0;
  let failed = 0;
  
  for (const l of locations) {
    const { error } = await supabase.from('locations').insert({
      id: generateUUID(l.LocationId, 'location'),
      name: l.Name,
      type: l.Type,
      is_active: true,
    });
    
    if (error) {
      failed++;
      console.log(`❌ ${l.Name}: ${error.message}`);
    } else {
      success++;
      console.log(`✅ ${l.Name}`);
    }
  }
  
  console.log(`\n📊 Done: ${success} success, ${failed} failed`);
}

migrateLocations().catch(console.error);
