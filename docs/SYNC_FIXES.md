# Lkscale ERP Synchronization Fixes

## Summary

This document describes the comprehensive synchronization fixes applied to resolve type mismatches between the application types, database schema, and data conversion functions.

## Issues Fixed

### 1. Product Type Conversions (lib/supabaseDataService.ts, services/syncService.ts)

**Issues:**
- `costPrice` (DB: `number | null`, App: `number` required)
- `sku` (DB: `string | null`, App: `string` required)
- `price` (DB: `number`, App: `number` required) - Added null coalescing for safety
- Missing computed fields (`margin`, `profit`) in converters

**Fixes:**
- Added proper null coalescing with defaults: `costPrice = db.cost_price ?? 0`
- Added computed fields calculation in converters
- Ensured `sku` defaults to empty string when null
- Added safety check for price calculation

### 2. Customer Type Conversions (lib/supabaseDataService.ts, services/syncService.ts)

**Issues:**
- `totalOrders` (DB: `number | null`, App: `number` required)
- `totalSpent` (DB: `number | null`, App: `number` required)
- `averageCheck` (DB: `number | null`, App: `number | undefined`)

**Fixes:**
- Added proper defaults with null coalescing: `totalOrders = db.total_orders ?? 0`
- Added computed `averageCheck` calculation when null: `totalOrders > 0 ? totalSpent / totalOrders : undefined`
- Fixed `customerToDbCustomer` to use `??` operator instead of undefined values

### 3. Order Type Conversions (lib/supabaseDataService.ts, services/syncService.ts)

**Issues:**
- `status` (DB: `string | null`, App: specific union type)
- `paymentMethod` (DB: `string | null`, App: specific union type)
- `items` (DB: `Json | null`, App: `OrderItem[]` required)
- Unsafe type casting without validation

**Fixes:**
- Added runtime validation for `status` against allowed values
- Added runtime validation for `paymentMethod` against allowed values
- Added safe JSON parsing with error handling for `items`
- Added proper item mapping with default values for each field
- Added fallback for `itemsCount` calculation from items array

### 4. Supplier Type Conversions (services/syncService.ts)

**Issues:**
- `leadTimeDays` (DB: `number | null`, App: `number` required)

**Fixes:**
- Changed from `||` to `??` operator for proper null handling: `leadTimeDays = db.lead_time_days ?? 0`

### 5. Manufacturer & Location Conversions (services/syncService.ts)

**Issues:**
- `name` (DB: `string`, App: `string` required) - Added fallback for empty string

**Fixes:**
- Added default empty string fallback: `name = db.name || ''`

### 6. Missing Helper Function (lib/supabaseDataService.ts)

**Issue:**
- `uploadBase64File` function was referenced but not defined

**Fix:**
- Implemented `uploadBase64File` helper function for Supabase Storage uploads
- Handles base64 data parsing with prefix removal
- Converts base64 to Uint8Array for upload
- Returns proper error handling with typed response

### 7. Type Exports (types/index.ts)

**Improvements:**
- Added explicit `OrderStatus` type export: `'pending' | 'processing' | 'completed' | 'cancelled'`
- Added explicit `PaymentMethod` type export: `'cash' | 'card' | 'transfer' | 'online'`
- Added `userId` field to `Customer` interface
- Added `avatarUrl` field to `Customer` interface
- Added `userId` field to `Supplier` interface
- Added `manufacturerId` and `supplierId` fields to `Product` interface
- Updated `Order` interface to use exported type aliases

## Files Modified

1. **lib/supabaseDataService.ts**
   - `dbProductToProduct()` - Enhanced with computed fields and null safety
   - `productToDbProduct()` - Added proper defaults for all fields
   - `dbCustomerToCustomer()` - Added computed averageCheck and null safety
   - `customerToDbCustomer()` - Fixed null coalescing operator usage
   - `dbOrderToOrder()` - Added runtime validation and safe JSON parsing
   - Added `uploadBase64File()` helper function

2. **services/syncService.ts**
   - `dbProductToProduct()` - Enhanced with computed fields and null safety
   - `dbCustomerToCustomer()` - Added computed averageCheck and null safety
   - `dbOrderToOrder()` - Added runtime validation and safe JSON parsing
   - `dbSupplierToSupplier()` - Fixed leadTimeDays null handling
   - `dbManufacturerToManufacturer()` - Added name fallback
   - `dbLocationToLocation()` - Added name fallback

3. **types/index.ts**
   - Added `OrderStatus` export type
   - Added `PaymentMethod` export type
   - Updated `Order` interface to use new type exports
   - Added missing fields to `Product`, `Customer`, and `Supplier` interfaces

## Benefits

1. **Type Safety**: Runtime validation ensures only valid enum values are used
2. **Null Safety**: Proper null coalescing prevents runtime errors from null database values
3. **Computed Fields**: Margin and profit calculations are now done during conversion
4. **Consistency**: Both service files now have identical conversion logic
5. **Error Handling**: Safe JSON parsing prevents crashes from malformed order items
6. **Missing Implementation**: Added the missing file upload helper function

## Testing Recommendations

1. Test creating products without cost_price (should default to 0)
2. Test creating customers without total_orders (should default to 0)
3. Test loading orders with invalid status values (should default to 'pending')
4. Test loading orders with malformed items JSON (should default to empty array)
5. Test image upload functionality
6. Verify computed fields (margin, profit) are calculated correctly

## Migration Notes

No database migration required - these fixes handle null values at the application layer.
