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

async function migrateProducts() {
  console.log('Migrating products...');
  const { data: existing } = await supabase.from('products').select('sku');
  const existingSkus = new Set(existing?.map(p => p.sku) || []);
  console.log(`Existing: ${existingSkus.size}`);
  
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dbo_Product.json'), 'utf8'));
  let success = 0, failed = 0, skipped = 0;
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (existingSkus.has(p.VendorCode)) { skipped++; continue; }
    
    const { error } = await supabase.from('products').insert({
      id: generateUUID(p.ProductId, 'product'),
      name: p.Name,
      sku: p.VendorCode,
      barcode: p.ManufacturerBarcodes || null,
      description: p.Description,
      price: parseFloat(p.PriceTypeValue) || 0,
      purchase_price: parseFloat(p.PurchasePrice) || 0,
      stock: 0,
      min_stock: p.MinStock || 0,
      is_active: !p.IsArchive,
      unit: 'шт',
      category: p.ProductCategoryIds?.toString() || null,
    });
    
    if (error) { failed++; if (failed <= 3) console.log(`Error: ${error.message}`); }
    else success++;
    
    if ((i + 1) % 100 === 0) console.log(`Progress: ${i + 1}/${products.length}`);
  }
  console.log(`Done: ${success} added, ${failed} failed, ${skipped} skipped`);
}

async function createLocations() {
  console.log('\nCreating locations...');
  const locations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dbo_Location.json'), 'utf8'));
  let success = 0, failed = 0;
  
  for (const l of locations) {
    const { error } = await supabase.from('locations').insert({
      id: generateUUID(l.LocationId, 'location'),
      name: l.Name,
      type: l.Type,
      is_active: true,
    });
    if (error) { failed++; console.log(`Error: ${error.message}`); }
    else success++;
  }
  console.log(`Done: ${success} success, ${failed} failed`);
}

async function migrate() {
  console.log('Starting migration...\n');
  await migrateProducts();
  await createLocations();
  console.log('\nMigration complete!');
}

migrate().catch(console.error);
