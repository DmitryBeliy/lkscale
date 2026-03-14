# Data Migration Guide

## Overview

This guide explains how to migrate data from the old MagGaz system (SQL Server backup: `maggaz_backup1.bak`) to the new Lkscale Supabase database.

### Source Data

The old system contains **26,344 records** across 13 tables:

| Source Table | Records | Description |
|--------------|---------|-------------|
| `dbo_Product` | 1,102 | Products catalog |
| `dbo_Supplier` | 18 | Suppliers |
| `dbo_ProductCategory` | 13 | Product categories |
| `dbo_Manufacturer` | 64 | Product manufacturers (Baxi, Vaillant, etc.) |
| `dbo_Location` | 9 | Warehouses and shops |
| `dbo_Outlet` | 3 | Sales channels (physical, website, marketplace) |
| `dbo_Order` | 5,173 | Customer orders |
| `dbo_OrderProduct` | 6,259 | Order line items |
| `dbo_ConsignmentNote` | 976 | Purchase receipts from suppliers |
| `dbo_ConsignmentNoteProduct` | 1,973 | Purchase receipt line items |
| `dbo_ProductLocation` | 1,080 | Inventory by location |
| `dbo_WriteOff` | 246 | Inventory write-offs |
| `dbo_UserActivityLog` | 10,192 | User activity audit trail |

---

## Data Mapping

### Table Mapping

| Old Table (Records) | New Table | Notes |
|---------------------|-----------|-------|
| `dbo_Product` (1,102) | `products` | Main product catalog |
| `dbo_Supplier` (18) | `suppliers` | Supplier information |
| `dbo_ProductCategory` (13) | `products.category` field | Categories stored as text |
| `dbo_Manufacturer` (64) | `manufacturers` | Product manufacturers |
| `dbo_Location` (9) | `locations` | Warehouses and shops |
| `dbo_Outlet` (3) | `outlets` | Sales channels |
| `dbo_Order` (5,173) | `orders` | Customer orders |
| `dbo_OrderProduct` (6,259) | `orders.items` JSON | Embedded in orders table |
| `dbo_ConsignmentNote` (976) | `purchase_orders` | Purchase orders |
| `dbo_ConsignmentNoteProduct` (1,973) | `purchase_order_items` | PO line items |
| `dbo_ProductLocation` (1,080) | `products.stock` + `product_locations` | Stock levels by location |
| `dbo_WriteOff` (246) | `stock_adjustments` | Inventory adjustments |
| `dbo_UserActivityLog` (10,192) | `user_activity_logs` | Audit trail |

### Field Mappings

#### Products (`dbo_Product` -> `products`)

| Old Field | New Field | Transformation |
|-----------|-----------|----------------|
| `ProductId` | `id` | INT -> UUID mapping |
| `VendorCode` | `sku` | Direct mapping |
| `Name` | `name` | Direct mapping |
| `ManufacturerId` | `manufacturer_id` | ID mapping via lookup |
| `CategoryId` | `category` | Category name lookup |
| `PriceTypeValue` | `price` | String -> Decimal |
| `Description` | `description` | Direct mapping |
| `MinStock` | `min_stock` | Direct mapping |
| `IsArchive` | `is_active` | Inverted boolean |
| `ManufacturerBarcodes` | `barcode` | Direct mapping |

#### Orders (`dbo_Order` -> `orders`)

| Old Field | New Field | Transformation |
|-----------|-----------|----------------|
| `OrderId` | `id` | INT -> UUID mapping |
| `Status` | `status` | 1=completed, 2=pending, etc. |
| `CreatedDateUtc` | `created_at` | Direct mapping |
| `OutletId` | - | ID mapping (not stored) |
| `Username` | - | Legacy field |
| `Comment` | `notes` | Direct mapping |
| `PaymentType` | `payment_method` | 1=cash, 2=card, etc. |
| `OrderProducts` | `items` | JSON array embedded |

#### Purchase Orders (`dbo_ConsignmentNote` -> `purchase_orders`)

| Old Field | New Field | Transformation |
|-----------|-----------|----------------|
| `ConsignmentNoteId` | `id` | INT -> UUID mapping |
| `SupplierId` | `supplier_id` | ID mapping via lookup |
| `CreatedDateUtc` | `created_at` | Direct mapping |
| `IsOwnerBalance` | - | Consignment flag |

---

## Prerequisites

Before running the migration:

1. **Database Schema Ready**
   - Run `schema.sql` to create base tables
   - Run `07_new_tables.sql` to create legacy tables

2. **Authentication Required**
   - User must be logged in to the app
   - Migration uses current user's ID for `user_id` fields

3. **Data Files Available**
   - JSON files extracted from old system in `docs/base/extracted_data/`

4. **Backup Recommended**
   - Export existing data before migration if needed

---

## SQL Execution Order

### Step 1: Base Schema

Run `schema.sql` first to create core tables:

```sql
-- Creates: categories, manufacturers, suppliers, products, orders, order_items, inventory_transactions, users
-- Enables RLS policies
-- Creates indexes
```

### Step 2: Legacy Tables

Run `07_new_tables.sql` to create tables for old system data:

```sql
-- Creates: locations, outlets, consignment_notes, consignment_note_products
-- Creates: product_locations, write_offs, user_activity_logs
-- Creates: migration_status tracking table
-- Adds legacy_id columns for ID mapping
```

---

## Running the Migration

### Using dataMigrationService

The migration is performed via the `dataMigrationService` in the app:

```typescript
import { dataMigrationService } from '@/services/dataMigrationService';

// Run full migration
const stats = await dataMigrationService.migrateAllData();

// Check status
const status = dataMigrationService.getMigrationStatus();

// Generate report
const report = dataMigrationService.generateReport();
```

### Migration Order

The service migrates data in dependency order:

1. **Reference Data** (no dependencies)
   - Manufacturers
   - Categories
   - Suppliers
   - Locations
   - Outlets

2. **Products** (depends on manufacturers, categories)

3. **Orders** (depends on products, outlets)

4. **Purchase Orders** (depends on suppliers, products)

5. **Stock Data** (depends on products)
   - Product locations
   - Write-offs -> stock_adjustments

6. **Activity Logs** (no dependencies)

### Code Example

```typescript
import { migrateAllData, getMigrationStatus, generateMigrationReport } from '@/services/dataMigrationService';

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Run migration
    const stats = await migrateAllData();
    
    // Log results
    console.log('Migration complete:', stats);
    
    // Generate and display report
    const report = generateMigrationReport();
    console.log(report);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
```

### Expected Duration

| Entity | Records | Est. Time |
|--------|---------|-----------|
| Manufacturers | 64 | < 1s |
| Categories | 13 | < 1s |
| Suppliers | 18 | < 1s |
| Products | 1,102 | 2-3s |
| Orders | 5,173 | 10-15s |
| Purchase Orders | 976 | 5-8s |
| Stock Adjustments | 246 | 2-3s |
| **Total** | **~7,500** | **20-30s** |

---

## Validation

### Automatic Validation

The migration service runs validation after completion:

```typescript
const validation = await dataMigrationService.validateMigration();
// Returns: { isValid: boolean, errors: string[], warnings: string[] }
```

### Manual Validation Queries

```sql
-- Check record counts
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'stock_adjustments', COUNT(*) FROM stock_adjustments;

-- Check for duplicate SKUs
SELECT sku, COUNT(*) as count 
FROM products 
WHERE sku IS NOT NULL 
GROUP BY sku 
HAVING COUNT(*) > 1;

-- Verify order items integrity
SELECT o.id, o.order_number, COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number
LIMIT 10;

-- Check stock consistency
SELECT p.name, p.stock, SUM(pl.count) as location_total
FROM products p
LEFT JOIN product_locations pl ON pl.product_uuid = p.id
GROUP BY p.id, p.name
HAVING p.stock != COALESCE(SUM(pl.count), 0);
```

### Expected Results

| Table | Expected Count |
|-------|----------------|
| products | 1,102 |
| suppliers | 18+ |
| orders | 5,173 |
| purchase_orders | 976 |
| stock_adjustments | 246 |

---

## Troubleshooting

### Error: "User must be authenticated"

**Cause**: User not logged in

**Solution**: Ensure user is authenticated before running migration

```typescript
const userId = getCurrentUserId();
if (!userId) {
  throw new Error('Please log in first');
}
```

### Error: "Failed to load JSON file"

**Cause**: JSON files not found in expected location

**Solution**: Verify files exist in `docs/base/extracted_data/`

### Error: "Foreign key violation"

**Cause**: Referenced record not found (e.g., product for order item)

**Solution**: Check migration order - reference tables must be migrated first

### Error: "Duplicate key value"

**Cause**: Data already exists

**Solution**: Clear existing data first

```typescript
await dataMigrationService.clearMigrationData();
```

### Slow Migration Performance

**Cause**: Large batch size or network latency

**Solution**: Adjust batch size in service (default: 100)

```typescript
// In dataMigrationService.ts
private batchSize: number = 50; // Reduce for slower connections
```

### Missing Legacy ID Mappings

**Cause**: ID mapping not established

**Solution**: Check that reference data migrated successfully before dependent tables

---

## Rollback

### Clear Migrated Data

To remove all migrated data:

```typescript
import { clearMigrationData } from '@/services/dataMigrationService';

await clearMigrationData();
```

This clears tables in reverse dependency order:
1. `stock_adjustments`
2. `purchase_order_items`
3. `purchase_orders`
4. `orders`
5. `products`
6. `suppliers`

### Manual Cleanup

```sql
-- Clear all migrated data (run in order)
TRUNCATE TABLE stock_adjustments CASCADE;
TRUNCATE TABLE purchase_order_items CASCADE;
TRUNCATE TABLE purchase_orders CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE suppliers CASCADE;

-- Reset migration status
UPDATE migration_status SET 
  migrated_count = 0, 
  status = 'pending', 
  last_migrated_at = NULL;
```

### Partial Rollback

To rollback specific tables only:

```sql
-- Remove only orders and related data
DELETE FROM orders WHERE user_id = 'your-user-id';
DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);

-- Remove only products
DELETE FROM products WHERE user_id = 'your-user-id';
```

---

## Migration Report Example

```
========================================
DATA MIGRATION REPORT
========================================
Generated: 2026-03-14T10:30:00.000Z
User ID: 550e8400-e29b-41d4-a716-446655440000

MIGRATION STATISTICS:
---------------------
Manufacturers:     64/64 (errors: 0)
Categories:        13/13 (errors: 0)
Suppliers:         18/18 (errors: 0)
Products:          1102/1102 (errors: 0)
Locations:         9/9 (errors: 0)
Outlets:           3/3 (errors: 0)
Orders:            5173/5173 (errors: 0)
Purchase Orders:   976/976 (errors: 0)
PO Items:          1973/1973 (errors: 0)
Stock Adjustments: 246/246 (errors: 0)
Activity Logs:     0/10192 (errors: 0)

SUMMARY:
--------
Total Records Migrated: 9574
Total Errors: 0
Success Rate: 100.00%
========================================
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `services/dataMigrationService.ts` | Main migration service |
| `docs/base/migration_sql/schema.sql` | Base schema creation |
| `docs/base/migration_sql/07_new_tables.sql` | Legacy tables creation |
| `docs/base/extracted_data/*.json` | Source data files |

---

## Support

For migration issues:
1. Check logs in browser console
2. Verify SQL execution order
3. Run validation queries
4. Check `migration_status` table for progress
