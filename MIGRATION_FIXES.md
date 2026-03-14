# Lkscale ERP Migration Fixes

This document describes the comprehensive fixes applied to adapt the Lkscale ERP backend and frontend for the migrated data from the old system.

## Files Created/Modified

### 1. Database Schema Alignment
**File:** `supabase/migrations/03_fix_schema_for_migrated_data.sql`

This SQL migration adds:
- `legacy_id` columns to track original IDs from the old system
- Missing columns that exist in migrated data but not in current schema
- Indexes for performance on frequently queried columns
- Updated RLS policies for proper data access
- Helper functions for data migration
- Views for data validation

**Run this migration first before importing data.**

### 2. Data Migration Service Fixes
**File:** `services/dataMigrationService.ts` (updated)
**Reference:** `services/dataMigrationService.patches.ts`

Key fixes applied:
- Added `productNames` and `productSkus` maps to track product info for order migration
- Added `parseCustomerFromUsername()` helper to extract customer data from order usernames
- Added `getProductNameByLegacyId()` and `getProductSkuByLegacyId()` helpers
- Fixed product mapping to properly handle:
  - `VendorCode` → `sku`
  - `PriceTypeValue` → `price`
  - `IsArchive` → `is_active` (inverted logic)
  - `legacy_id` tracking
- Fixed order items to use stored product names instead of empty strings
- Fixed order customer data extraction from `Username` field

### 3. Data Store Updates
**File:** `store/dataStore.ts` (needs manual patching)
**Reference:** `store/dataStore.patches.ts`

Key fixes to apply:
- Add safe product mapping with null checks
- Add safe order mapping with JSON item handling
- Add safe customer mapping
- Update all getter methods to handle null/undefined
- Update search functions with safe null checking
- Safe margin and profit calculations

### 4. Type Alignments
**File:** `types/database.ts` (needs manual patching)
**Reference:** `types/database.patches.ts`

Add to all relevant tables:
- `legacy_id: number | null` field
- Make `user_id` nullable for system-imported data
- Add order legacy fields: `legacy_outlet_id`, `legacy_username`, `legacy_customer_id`

### 5. Frontend Screen Fixes
**Files:** 
- `app/(tabs)/inventory.tsx`
- `app/(tabs)/orders.tsx`
- `app/(tabs)/index.tsx`

**References:** 
- `app/(tabs)/inventory.patches.tsx`
- `app/(tabs)/orders.patches.tsx`
- `app/(tabs)/index.patches.tsx`

Key fixes:
- Handle products without images
- Safe product/order/customer filtering with null checks
- Handle missing customer names in orders
- Safe KPI display with null checks
- Safe activity items rendering

### 6. Data Validation Script
**File:** `scripts/validate-migrated-data.mjs`

Node.js script that:
- Connects to Supabase
- Validates migrated data integrity
- Checks for orphaned records
- Reports data quality issues
- Suggests fixes

**Usage:**
```bash
# Set environment variables
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run validation
node scripts/validate-migrated-data.mjs
```

## Field Mappings Reference

### Products (from dbo_Product.json)
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `ProductId` | `legacy_id` | Track original ID |
| `VendorCode` | `sku` | Article/vendor code |
| `Name` | `name` | Product name |
| `PriceTypeValue` | `price` | Selling price |
| `PurchasePrice` | `cost_price` | Purchase cost |
| `Description` | `description` | Product description |
| `MinStock` | `min_stock` | Minimum stock level |
| `IsArchive` | `is_active` | **Inverted!** `true` = inactive |
| `ManufacturerBarcodes` | `barcode` | Product barcode |
| `ManufacturerId` | `manufacturer_id` | Foreign key to manufacturers |
| `CategoryId` | `category_id` | Foreign key to categories |

### Orders (from dbo_Order.json)
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `OrderId` | `legacy_id` | Track original ID |
| `Status` | `status` | Mapped: 1→completed, 2→pending, 3→processing, 4→cancelled |
| `CreatedDateUtc` | `created_at` | Order creation date |
| `Total` | `total_amount` | Order total |
| `Username` | `customer_name` + `customer_phone` | Parsed for customer info |
| `Comment` | `notes` | Order comments |
| `PaymentType` | `payment_method` | Mapped: 1→cash, 2→card, 3→transfer, 4→online |
| `OutletId` | `legacy_outlet_id` | Track original outlet |

### Order Items (from dbo_OrderProduct.json)
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `OrderProductId` | - | Not needed (new UUID generated) |
| `OrderId` | - | Linked via order reference |
| `ProductId` | `productId` | Mapped to new product UUID |
| `Price` | `price` | Item price |
| `Count` | `quantity` | Item quantity |
| `PurchasePrice` | - | Used for cost calculation |

### Customers (extracted from orders)
Derived from unique `Username` values in orders. Parsed format:
- `"John Doe (+79991234567)"` → name: "John Doe", phone: "+79991234567"
- `"+79991234567"` → phone only
- `"John Doe"` → name only

## Migration Execution Order

1. **Run schema migration:**
   ```sql
   -- In Supabase SQL Editor
   \i supabase/migrations/03_fix_schema_for_migrated_data.sql
   ```

2. **Verify schema:**
   ```sql
   SELECT * FROM migrated_data_summary;
   ```

3. **Run data migration** (via the app or Node.js script)

4. **Validate migrated data:**
   ```bash
   node scripts/validate-migrated-data.mjs
   ```

5. **Review and fix any issues** reported by the validation script

## Common Issues and Fixes

### Issue: Duplicate SKUs
**Fix:** Review and manually update duplicate SKUs in the old data before migration.

### Issue: Invalid Prices
**Fix:** Run the SQL fix:
```sql
UPDATE products SET price = 0 WHERE price IS NULL OR price < 0;
```

### Issue: Negative Stock
**Fix:** Run the SQL fix:
```sql
UPDATE products SET stock = 0 WHERE stock < 0;
```

### Issue: Orphaned Order Items
**Fix:** Review orders referencing non-existent products. Either:
- Restore the missing products
- Remove the orphaned order items

### Issue: Missing Customer Data
**Fix:** The migration extracts customers from order usernames. Review extracted customers after migration.

## Testing Checklist

- [ ] All products display correctly in inventory
- [ ] Products without images show placeholder
- [ ] Orders display with correct customer names
- [ ] Order totals calculate correctly
- [ ] Low stock alerts work correctly
- [ ] Search works for products, orders, and customers
- [ ] KPI cards show correct values on dashboard
- [ ] No console errors when viewing migrated data
- [ ] Validation script reports no critical errors

## Rollback Plan

If migration fails:

1. Stop the migration process
2. Clear migrated data:
   ```sql
   -- Clear in reverse dependency order
   DELETE FROM stock_adjustments WHERE legacy_id IS NOT NULL;
   DELETE FROM purchase_order_items WHERE purchase_order_id IN (
     SELECT id FROM purchase_orders WHERE legacy_id IS NOT NULL
   );
   DELETE FROM purchase_orders WHERE legacy_id IS NOT NULL;
   DELETE FROM orders WHERE legacy_id IS NOT NULL;
   DELETE FROM customers WHERE source = 'migrated_from_orders';
   DELETE FROM products WHERE legacy_id IS NOT NULL;
   DELETE FROM suppliers WHERE legacy_id IS NOT NULL;
   ```
3. Fix issues in source data
4. Re-run migration

## Support

For issues with the migration:
1. Check the validation script output
2. Review the migration logs
3. Check the `migrated_data_summary` view in Supabase
4. Consult the patch files for implementation details
