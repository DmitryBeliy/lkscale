import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const DATA_DIR = path.join(__dirname, '../docs/base/extracted_data');

function generateUUID(id, prefix) {
  const p = prefix.padEnd(8, '0').slice(0, 8);
  const idStr = id.toString().padStart(12, '0');
  return `${p}-0000-0000-${idStr.slice(0, 4)}-${idStr.slice(4).padEnd(12, '0')}`;
}

async function migrateTable(tableName, jsonFile, transformFn) {
  console.log(`\n🔄 Migrating ${tableName}...`);
  
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, jsonFile), 'utf8'));
  console.log(`   Found ${data.length} records`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < data.length; i++) {
    const record = transformFn(data[i]);
    if (!record) continue;
    
    const { error } = await supabase.from(tableName).upsert(record, { onConflict: 'id' });
    
    if (error) {
      failed++;
      if (failed <= 3) console.log(`   ❌ ${error.message}`);
    } else {
      success++;
    }
    
    if ((i + 1) % 100 === 0 || i === data.length - 1) {
      console.log(`   Progress: ${i + 1}/${data.length}`);
    }
  }
  
  console.log(`   ✅ Done: ${success} success, ${failed} failed`);
  return { success, failed, total: data.length };
}

async function continueMigration() {
  console.log('🚀 Continuing migration...\n');
  
  const results = {};
  
  // 1. Locations
  results.locations = await migrateTable('locations', 'dbo_Location.json', (l) => ({
    id: generateUUID(l.LocationId, 'location'),
    legacy_id: l.LocationId,
    name: l.Name,
    type: l.Type,
    is_active: true,
  }));
  
  // 2. Products - migrate all (will update existing)
  results.products = await migrateTable('products', 'dbo_Product.json', (p) => ({
    id: generateUUID(p.ProductId, 'product'),
    legacy_id: p.ProductId,
    name: p.Name,
    sku: p.VendorCode,
    price: parseFloat(p.PriceTypeValue) || 0,
    description: p.Description,
    min_stock: p.MinStock || 0,
    is_active: !p.IsArchive,
    barcode: p.ManufacturerBarcodes || null,
  }));
  
  // 3. Orders
  results.orders = await migrateTable('orders', 'dbo_Order.json', (o) => ({
    id: generateUUID(o.OrderId, 'order'),
    legacy_id: o.OrderId,
    customer_name: o.CustomerName,
    total_amount: parseFloat(o.Total) || 0,
    status: o.Status === 0 ? 'completed' : 'pending',
    created_at: o.CreatedDateUtc,
    is_active: !o.IsArchive,
  }));
  
  console.log('\n📊 Summary:');
  for (const [table, r] of Object.entries(results)) {
    if (r) console.log(`   ${table}: ${r.success}/${r.total}`);
  }
}

continueMigration().catch(console.error);
