# Supabase Migration MCP Server

MCP (Model Context Protocol) server for migrating data from legacy SQL Server exports to Supabase PostgreSQL.

## Features

- **Execute SQL**: Run raw SQL queries in Supabase
- **Migrate Tables**: Batch migrate data from JSON exports with automatic ID mapping (INT → UUID)
- **Progress Tracking**: Monitor migration status in real-time
- **Data Validation**: Verify migrated data integrity
- **Vercel Integration**: Trigger redeployments after migration

## Installation

```bash
cd .kilocode/mcp
npm install
npm run build
```

## Configuration

The server is pre-configured with:
- **Supabase URL**: `https://onnncepenxxxfprqaodu.supabase.co`
- **Service Role Key**: Embedded (full database access)

## Available Tools

### 1. execute_sql
Execute raw SQL queries in Supabase.

```json
{
  "query": "SELECT * FROM manufacturers LIMIT 10",
  "response_format": "markdown"
}
```

### 2. migrate_table
Migrate a specific table from JSON export.

```json
{
  "table_name": "dbo_Manufacturer",
  "batch_size": 100,
  "continue_migration": false,
  "response_format": "markdown"
}
```

**Supported Tables:**
| Table | Records |
|-------|---------|
| dbo_Manufacturer | 64 |
| dbo_Supplier | 18 |
| dbo_Product | 1102 |
| dbo_Order | 5173 |
| dbo_OrderProduct | 6259 |
| dbo_ConsignmentNote | 976 |
| dbo_ConsignmentNoteProduct | 1973 |
| dbo_ProductLocation | 1080 |
| dbo_WriteOff | 246 |
| dbo_UserActivityLog | 10192 |

### 3. get_migration_status
Check migration progress.

```json
{
  "table_name": "dbo_Manufacturer",
  "response_format": "markdown"
}
```

### 4. validate_migration
Validate migrated data integrity.

```json
{
  "table_name": "dbo_Manufacturer",
  "sample_size": 10,
  "response_format": "markdown"
}
```

### 5. deploy_to_vercel
Trigger Vercel redeployment.

```json
{
  "vercel_token": "your_token",
  "project_id": "your_project_id",
  "team_id": "optional_team_id",
  "response_format": "markdown"
}
```

## Data Files

Migration data is loaded from `docs/base/extracted_data/`:
- JSON exports from legacy SQL Server database
- Schema mapping in `schema.json`

## ID Mapping

Legacy integer IDs are mapped to UUIDs using a deterministic algorithm:
- Format: `xxxxxxxx-0000-0000-xxxx-xxxxxxxxxxxx`
- Based on table prefix + original ID
- Ensures referential integrity across tables

## Error Handling

- Automatic retry on network failures (3 attempts)
- Failed records tracked for manual review
- Batch processing continues on individual record failures

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase-migration": {
      "command": "node",
      "args": ["/path/to/lkscale/.kilocode/mcp/dist/migration-server.js"]
    }
  }
}
```

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Clean
npm run clean
```
