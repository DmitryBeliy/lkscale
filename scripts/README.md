# Data Migration Script

Node.js script for migrating data from JSON files to Supabase.

## Prerequisites

- Node.js 18 or higher
- Supabase project with tables created
- Service role key from Supabase

## Setup

1. Install dependencies:
```bash
cd scripts
npm install
```

2. Create a `.env` file in the scripts directory:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MIGRATION_USER_ID=your-user-uuid
```

3. Or use the root `.env` file with these variables:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MIGRATION_USER_ID=your-user-uuid
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (not anon key) | Yes |
| `MIGRATION_USER_ID` | User ID that will own all migrated data | Yes |

## Usage

Run the migration:
```bash
npm run migrate
```

Or directly:
```bash
node scripts/run-migration.js
```

## Migration Order

The script migrates data in the following order to respect foreign key relationships:

1. **Reference Data** (no dependencies)
   - Manufacturers (64 records)
   - Categories (13 records)
   - Suppliers (18 records)
   - Locations (9 records)
   - Outlets (3 records)

2. **Products** (depends on manufacturers, categories)
   - 1102 products

3. **Orders with Items** (depends on products)
   - 5173 orders
   - 6259 order items

4. **Purchase Orders with Items** (depends on suppliers, products)
   - 976 consignment notes
   - 1973 consignment note products

5. **Stock Data** (depends on products)
   - 1080 product location records
   - 246 write-offs

6. **Activity Logs** (no dependencies)
   - 10192 activity logs

## Output

The script will:
- Display progress for each migration step
- Show a summary report at the end
- Save ID mappings to `scripts/migration-id-mappings.json`

## Troubleshooting

### Connection Errors
- Verify your Supabase URL is correct
- Ensure you're using the service role key, not the anon key
- Check that your IP is allowed in Supabase settings

### Missing Tables
The script assumes the following tables exist in Supabase:
- `manufacturers`
- `categories`
- `suppliers`
- `locations`
- `outlets`
- `products`
- `orders`
- `purchase_orders`
- `purchase_order_items`
- `stock_adjustments`
- `user_activity_logs`

Run the migration SQL files first to create these tables.

### Rate Limiting
If you encounter rate limits, reduce the `batchSize` in the script (default: 100).
