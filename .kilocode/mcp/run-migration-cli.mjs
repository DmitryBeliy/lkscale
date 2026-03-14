#!/usr/bin/env node
/**
 * CLI для запуска миграции через MCP сервер
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DATA_DIR = path.join(__dirname, '../../docs/base/extracted_data');

// ID mapping store
const idMapping = new Map();

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
    
    const { error } = await supabase
      .from(tableName)
      .upsert(record, { onConflict: 'id' });
    
    if (error) {
      failed++;
      if (failed <= 3) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    } else {
      success++;
    }
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Progress: ${i + 1}/${data.length}`);
    }
  }
  
  console.log(`   ✅ Success: ${success}, ❌ Failed: ${failed}`);
  return { success, failed, total: data.length };
}

async function runMigration() {
  console.log('🚀 Starting migration to Supabase...');
  console.log(`   URL: ${SUPABASE_URL}`);
  
  const results = {};
  
  // 1. Manufacturers
  results.manufacturers = await migrateTable('manufacturers', 'dbo_Manufacturer.json', (m) => {
    const id = generateUUID(m.ManufacturerId, 'manufact');
    idMapping.set(`manufacturer_${m.ManufacturerId}`, id);
    return {
      id,
      legacy_id: m.ManufacturerId,
      name: m.Name,
      is_active: true,
    };
  });
  
  // 2. Suppliers
  results.suppliers = await migrateTable('suppliers', 'dbo_Supplier.json', (s) => {
    const id = generateUUID(s.SupplierId, 'supplier');
    idMapping.set(`supplier_${s.SupplierId}`, id);
    return {
      id,
      legacy_id: s.SupplierId,
      name: s.Name,
      is_active: true,
    };
  });
  
  // 3. Locations
  results.locations = await migrateTable('locations', 'dbo_Location.json', (l) => {
    const id = generateUUID(l.LocationId, 'location');
    idMapping.set(`location_${l.LocationId}`, id);
    return {
      id,
      legacy_id: l.LocationId,
      name: l.Name,
      type: l.Type,
      is_active: true,
    };
  });
  
  // 4. Products
  results.products = await migrateTable('products', 'dbo_Product.json', (p) => {
    const id = generateUUID(p.ProductId, 'product');
    idMapping.set(`product_${p.ProductId}`, id);
    return {
      id,
      legacy_id: p.ProductId,
      name: p.Name,
      sku: p.VendorCode,
      price: parseFloat(p.PriceTypeValue) || 0,
      description: p.Description,
      min_stock: p.MinStock || 0,
      is_active: !p.IsArchive,
      barcode: p.ManufacturerBarcodes || null,
    };
  });
  
  // Summary
  console.log('\n📊 Migration Summary:');
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalRecords = 0;
  
  for (const [table, result] of Object.entries(results)) {
    console.log(`   ${table}: ${result.success}/${result.total} (failed: ${result.failed})`);
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalRecords += result.total;
  }
  
  console.log(`\n   Total: ${totalSuccess}/${totalRecords} migrated (${totalFailed} failed)`);
  console.log(`   Success rate: ${((totalSuccess / totalRecords) * 100).toFixed(2)}%`);
  
  // Save ID mappings
  fs.writeFileSync('migration-mappings.json', JSON.stringify(Object.fromEntries(idMapping), null, 2));
  console.log('\n💾 ID mappings saved to migration-mappings.json');
}

runMigration().catch(console.error);
