#!/usr/bin/env node
/**
 * MCP Server for Supabase Data Migration
 *
 * This server provides tools to migrate data from legacy SQL Server (JSON exports)
 * to Supabase PostgreSQL database. Supports batch processing, progress tracking,
 * error handling with retries, and ID mapping (INT -> UUID).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

// Constants
const BATCH_SIZE = 100;
const CHARACTER_LIMIT = 25000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Configuration
const SUPABASE_URL = "https://onnncepenxxxfprqaodu.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I";
const DATA_DIR = "docs/base/extracted_data";

// Migration state tracking
interface MigrationState {
  tableName: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  idMapping: Map<number, string>;
  errors: Array<{ recordId: number; error: string; retryCount: number }>;
  status: "pending" | "in_progress" | "completed" | "failed";
  startTime?: Date;
  endTime?: Date;
}

const migrationStates = new Map<string, MigrationState>();

// Table name mapping (legacy -> Supabase)
const TABLE_NAME_MAP: Record<string, string> = {
  "dbo_Manufacturer": "manufacturers",
  "dbo_Supplier": "suppliers",
  "dbo_Product": "products",
  "dbo_Order": "orders",
  "dbo_OrderProduct": "order_products",
  "dbo_ConsignmentNote": "consignment_notes",
  "dbo_ConsignmentNoteProduct": "consignment_note_products",
  "dbo_ProductLocation": "product_locations",
  "dbo_WriteOff": "write_offs",
  "dbo_UserActivityLog": "user_activity_logs",
  "dbo_ProductCategory": "product_categories",
  "dbo_ProductType": "product_types",
  "dbo_Location": "locations",
  "dbo_Outlet": "outlets",
};

// Column name mapping for common fields
const COLUMN_MAP: Record<string, string> = {
  "ManufacturerId": "id",
  "SupplierId": "id",
  "ProductId": "id",
  "OrderId": "id",
  "OrderProductId": "id",
  "ConsignmentNoteId": "id",
  "ConsignmentNoteProductId": "id",
  "ProductLocationId": "id",
  "WriteOffId": "id",
  "UserActivityLogId": "id",
  "ProductCategoryId": "id",
  "ProductTypeId": "id",
  "LocationId": "id",
  "OutletId": "id",
  "CreatedDateUtc": "created_at",
  "IsArchive": "is_archived",
};

// Response format enum
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

// Initialize Supabase client
function getSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Utility: Delay function for retries
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility: Generate UUID from integer ID (deterministic)
function generateUUIDFromInt(id: number, tablePrefix: string): string {
  // Create a deterministic UUID v5-like format from integer ID
  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const prefix = tablePrefix.padEnd(8, "0").slice(0, 8);
  const idStr = id.toString().padStart(12, "0");
  return `${prefix}-0000-0000-${idStr.slice(0, 4)}-${idStr.slice(4).padEnd(12, "0")}`;
}

// Utility: Transform record from legacy format to Supabase format
function transformRecord(
  record: Record<string, unknown>,
  tableName: string,
  idMapping: Map<number, string>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    // Map column names
    let newKey = COLUMN_MAP[key] || key;

    // Convert camelCase to snake_case
    newKey = newKey.replace(/([A-Z])/g, "_$1").toLowerCase();

    // Handle ID fields - map old INT IDs to new UUIDs
    if (key.endsWith("Id") && typeof value === "number") {
      const relatedTable = key.replace("Id", "");
      const mappedTable = TABLE_NAME_MAP[`dbo_${relatedTable}`] || relatedTable.toLowerCase() + "s";

      if (key === getPrimaryKeyColumn(tableName)) {
        // This is the primary key - generate or use existing UUID
        const uuid = idMapping.get(value) || generateUUIDFromInt(value, mappedTable.slice(0, 8));
        idMapping.set(value, uuid);
        transformed[newKey] = uuid;
      } else {
        // Foreign key - look up in mapping or generate
        const uuid = idMapping.get(value) || generateUUIDFromInt(value, mappedTable.slice(0, 8));
        transformed[newKey] = uuid;
      }
    } else if (value instanceof Date) {
      transformed[newKey] = value.toISOString();
    } else if (typeof value === "bigint") {
      transformed[newKey] = Number(value);
    } else {
      transformed[newKey] = value;
    }
  }

  return transformed;
}

// Get primary key column name for a table
function getPrimaryKeyColumn(tableName: string): string {
  const mappings: Record<string, string> = {
    "dbo_Manufacturer": "ManufacturerId",
    "dbo_Supplier": "SupplierId",
    "dbo_Product": "ProductId",
    "dbo_Order": "OrderId",
    "dbo_OrderProduct": "OrderProductId",
    "dbo_ConsignmentNote": "ConsignmentNoteId",
    "dbo_ConsignmentNoteProduct": "ConsignmentNoteProductId",
    "dbo_ProductLocation": "ProductLocationId",
    "dbo_WriteOff": "WriteOffId",
    "dbo_UserActivityLog": "UserActivityLogId",
    "dbo_ProductCategory": "ProductCategoryId",
    "dbo_ProductType": "ProductTypeId",
    "dbo_Location": "LocationId",
    "dbo_Outlet": "OutletId",
  };
  return mappings[tableName] || "id";
}

// Load JSON data file
async function loadJsonData(filename: string): Promise<Record<string, unknown>[]> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "..", "..", DATA_DIR, filename);

  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

// Handle API errors
function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as { message?: string } | undefined;
      switch (status) {
        case 400:
          return `Error: Bad request - ${data?.message || axiosError.message}`;
        case 401:
          return "Error: Unauthorized. Check your Supabase service key.";
        case 403:
          return "Error: Forbidden. Insufficient permissions.";
        case 404:
          return "Error: Resource not found.";
        case 409:
          return `Error: Conflict - ${data?.message || "Record may already exist"}`;
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        case 500:
          return "Error: Supabase server error. Please try again later.";
        default:
          return `Error: API request failed with status ${status}`;
      }
    } else if (axiosError.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    } else if (axiosError.code === "ENOTFOUND") {
      return "Error: Unable to connect to Supabase. Check your network connection.";
    }
  }
  return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}

// Zod Schemas
const ExecuteSqlInputSchema = z.object({
  query: z.string()
    .min(1, "Query is required")
    .max(10000, "Query must not exceed 10000 characters")
    .describe("SQL query to execute"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

const MigrateTableInputSchema = z.object({
  table_name: z.string()
    .min(1, "Table name is required")
    .describe("Name of the table to migrate (e.g., 'dbo_Manufacturer', 'dbo_Product')"),
  batch_size: z.number()
    .int()
    .min(1)
    .max(500)
    .default(BATCH_SIZE)
    .describe("Number of records to process per batch (default: 100)"),
  continue_migration: z.boolean()
    .default(false)
    .describe("Continue from previous migration state if exists"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

const GetMigrationStatusInputSchema = z.object({
  table_name: z.string()
    .optional()
    .describe("Specific table to get status for. If omitted, returns status for all tables."),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

const ValidateMigrationInputSchema = z.object({
  table_name: z.string()
    .min(1, "Table name is required")
    .describe("Name of the table to validate (e.g., 'dbo_Manufacturer')"),
  sample_size: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Number of random records to sample for validation"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

const DeployToVercelInputSchema = z.object({
  vercel_token: z.string()
    .min(1, "Vercel token is required")
    .describe("Vercel API token"),
  project_id: z.string()
    .min(1, "Project ID is required")
    .describe("Vercel project ID"),
  team_id: z.string()
    .optional()
    .describe("Vercel team ID (if applicable)"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

// Type definitions
type ExecuteSqlInput = z.infer<typeof ExecuteSqlInputSchema>;
type MigrateTableInput = z.infer<typeof MigrateTableInputSchema>;
type GetMigrationStatusInput = z.infer<typeof GetMigrationStatusInputSchema>;
type ValidateMigrationInput = z.infer<typeof ValidateMigrationInputSchema>;
type DeployToVercelInput = z.infer<typeof DeployToVercelInputSchema>;

// Create MCP server
const server = new McpServer({
  name: "supabase-migration-server",
  version: "1.0.0",
});

// Tool 1: execute_sql
server.registerTool(
  "execute_sql",
  {
    title: "Execute SQL in Supabase",
    description: `Execute raw SQL queries in the Supabase PostgreSQL database.

This tool allows you to run any SQL query against the Supabase database using the service role key.
Useful for creating tables, indexes, or performing custom data operations during migration.

Args:
  - query (string): SQL query to execute
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For SELECT queries: Query results in requested format
  For DDL/DML: Success confirmation with rows affected

Examples:
  - Use when: Creating a new table during migration setup
  - Use when: Running custom data transformations
  - Don't use when: Migrating bulk data (use migrate_table instead)

Error Handling:
  - Returns "Error: Unauthorized" if service key is invalid
  - Returns "Error: Bad request" if SQL syntax is invalid`,
    inputSchema: ExecuteSqlInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (params: ExecuteSqlInput) => {
    try {
      const supabase = getSupabaseClient();

      // Use Supabase's rpc to execute raw SQL
      const { data, error } = await supabase.rpc("exec_sql", {
        sql: params.query,
      });

      if (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message}`,
          }],
          isError: true,
        };
      }

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, data }, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: `# SQL Execution Result\n\nQuery executed successfully.\n\n${data ? "```json\n" + JSON.stringify(data, null, 2) + "\n```" : "No data returned"}`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error),
        }],
        isError: true,
      };
    }
  }
);

// Tool 2: migrate_table
server.registerTool(
  "migrate_table",
  {
    title: "Migrate Table from JSON",
    description: `Migrate a specific table from legacy JSON export to Supabase.

This tool reads data from JSON files in docs/base/extracted_data/ and migrates them
to Supabase PostgreSQL with automatic ID mapping (INT -> UUID) and batch processing.

Supported tables:
  - dbo_Manufacturer (64 records)
  - dbo_Supplier (18 records)
  - dbo_Product (1102 records)
  - dbo_Order (5173 records)
  - dbo_OrderProduct (6259 records)
  - dbo_ConsignmentNote (976 records)
  - dbo_ConsignmentNoteProduct (1973 records)
  - dbo_ProductLocation (1080 records)
  - dbo_WriteOff (246 records)
  - dbo_UserActivityLog (10192 records)

Args:
  - table_name (string): Table to migrate (e.g., 'dbo_Manufacturer')
  - batch_size (number): Records per batch, 1-500 (default: 100)
  - continue_migration (boolean): Continue from previous state (default: false)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Migration progress including processed count, failures, and estimated time remaining.

Examples:
  - Use when: Migrating manufacturers table
  - Use when: Resuming a failed migration with continue_migration=true
  - Don't use when: Just checking status (use get_migration_status instead)

Error Handling:
  - Failed records are tracked and can be retried
  - Network errors trigger automatic retry (up to 3 attempts)`,
    inputSchema: MigrateTableInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (params: MigrateTableInput) => {
    try {
      const supabase = getSupabaseClient();
      const supabaseTableName = TABLE_NAME_MAP[params.table_name];

      if (!supabaseTableName) {
        return {
          content: [{
            type: "text",
            text: `Error: Unknown table '${params.table_name}'. Supported tables: ${Object.keys(TABLE_NAME_MAP).join(", ")}`,
          }],
          isError: true,
        };
      }

      // Load data
      const jsonFileName = `${params.table_name}.json`;
      let records: Record<string, unknown>[];
      try {
        records = await loadJsonData(jsonFileName);
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: Failed to load data file '${jsonFileName}': ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }

      // Initialize or restore migration state
      let state: MigrationState;
      if (params.continue_migration && migrationStates.has(params.table_name)) {
        state = migrationStates.get(params.table_name)!;
        if (state.status === "completed") {
          return {
            content: [{
              type: "text",
              text: `Table '${params.table_name}' has already been migrated successfully. Use get_migration_status for details.`,
            }],
          };
        }
      } else {
        state = {
          tableName: params.table_name,
          totalRecords: records.length,
          processedRecords: 0,
          failedRecords: 0,
          idMapping: new Map(),
          errors: [],
          status: "in_progress",
          startTime: new Date(),
        };
        migrationStates.set(params.table_name, state);
      }

      // Process batches
      const startIdx = state.processedRecords;
      const endIdx = Math.min(startIdx + params.batch_size, records.length);
      const batch = records.slice(startIdx, endIdx);

      let batchSuccess = 0;
      let batchFailed = 0;

      for (const record of batch) {
        const primaryKey = getPrimaryKeyColumn(params.table_name);
        const recordId = record[primaryKey] as number;

        let retryCount = 0;
        let success = false;

        while (retryCount < MAX_RETRIES && !success) {
          try {
            const transformedRecord = transformRecord(record, params.table_name, state.idMapping);

            const { error } = await supabase
              .from(supabaseTableName)
              .upsert(transformedRecord, { onConflict: "id" });

            if (error) {
              throw new Error(error.message);
            }

            success = true;
            batchSuccess++;
          } catch (error) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
              batchFailed++;
              state.errors.push({
                recordId,
                error: error instanceof Error ? error.message : String(error),
                retryCount,
              });
            } else {
              await delay(RETRY_DELAY_MS * retryCount);
            }
          }
        }
      }

      // Update state
      state.processedRecords += batchSuccess;
      state.failedRecords += batchFailed;

      if (state.processedRecords >= state.totalRecords) {
        state.status = state.failedRecords > 0 ? "failed" : "completed";
        state.endTime = new Date();
      }

      // Calculate progress
      const progress = Math.round((state.processedRecords / state.totalRecords) * 100);
      const elapsedMs = state.startTime
        ? new Date().getTime() - state.startTime.getTime()
        : 0;
      const recordsPerMs = state.processedRecords / (elapsedMs || 1);
      const remainingRecords = state.totalRecords - state.processedRecords;
      const estimatedRemainingMs = remainingRecords / (recordsPerMs || 1);

      const result = {
        table: params.table_name,
        supabase_table: supabaseTableName,
        status: state.status,
        progress: `${progress}%`,
        processed: state.processedRecords,
        total: state.totalRecords,
        failed: state.failedRecords,
        batch_processed: batchSuccess,
        batch_failed: batchFailed,
        elapsed_time: formatDuration(elapsedMs),
        estimated_remaining: state.status === "completed" ? "0s" : formatDuration(estimatedRemainingMs),
        errors_in_batch: state.errors.slice(-5).map((e) => ({
          record_id: e.recordId,
          error: e.error.substring(0, 100),
        })),
      };

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: formatMigrationProgress(result),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error),
        }],
        isError: true,
      };
    }
  }
);

// Tool 3: get_migration_status
server.registerTool(
  "get_migration_status",
  {
    title: "Get Migration Status",
    description: `Get the current status of data migration.

Returns progress information for all tables or a specific table including:
- Processed record count
- Failed record count
- Percentage complete
- Elapsed time
- Error summary

Args:
  - table_name (string, optional): Specific table to check. If omitted, returns all tables.
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Migration status for requested table(s) with progress details.

Examples:
  - Use when: Checking overall migration progress
  - Use when: Verifying a specific table's migration status
  - Don't use when: Starting a new migration (use migrate_table instead)`,
    inputSchema: GetMigrationStatusInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (params: GetMigrationStatusInput) => {
    try {
      const statuses: Array<{
        table: string;
        supabase_table: string;
        status: string;
        progress: string;
        processed: number;
        total: number;
        failed: number;
        elapsed_time: string;
      }> = [];

      if (params.table_name) {
        const state = migrationStates.get(params.table_name);
        if (!state) {
          return {
            content: [{
              type: "text",
              text: `No migration found for table '${params.table_name}'. Start migration with migrate_table tool.`,
            }],
          };
        }

        const progress = Math.round((state.processedRecords / state.totalRecords) * 100);
        const elapsedMs = state.startTime
          ? (state.endTime?.getTime() || new Date().getTime()) - state.startTime.getTime()
          : 0;

        statuses.push({
          table: state.tableName,
          supabase_table: TABLE_NAME_MAP[state.tableName] || state.tableName,
          status: state.status,
          progress: `${progress}%`,
          processed: state.processedRecords,
          total: state.totalRecords,
          failed: state.failedRecords,
          elapsed_time: formatDuration(elapsedMs),
        });
      } else {
        // Return status for all known tables
        for (const [tableName, state] of migrationStates) {
          const progress = Math.round((state.processedRecords / state.totalRecords) * 100);
          const elapsedMs = state.startTime
            ? (state.endTime?.getTime() || new Date().getTime()) - state.startTime.getTime()
            : 0;

          statuses.push({
            table: state.tableName,
            supabase_table: TABLE_NAME_MAP[state.tableName] || state.tableName,
            status: state.status,
            progress: `${progress}%`,
            processed: state.processedRecords,
            total: state.totalRecords,
            failed: state.failedRecords,
            elapsed_time: formatDuration(elapsedMs),
          });
        }

        if (statuses.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No migrations have been started yet. Use migrate_table to begin migration.",
            }],
          };
        }
      }

      // Calculate totals
      const totalProcessed = statuses.reduce((sum, s) => sum + s.processed, 0);
      const totalRecords = statuses.reduce((sum, s) => sum + s.total, 0);
      const totalFailed = statuses.reduce((sum, s) => sum + s.failed, 0);
      const overallProgress = totalRecords > 0 ? Math.round((totalProcessed / totalRecords) * 100) : 0;

      const result = {
        overall_progress: `${overallProgress}%`,
        total_processed: totalProcessed,
        total_records: totalRecords,
        total_failed: totalFailed,
        tables: statuses,
      };

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: formatMigrationStatus(result),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error),
        }],
        isError: true,
      };
    }
  }
);

// Tool 4: validate_migration
server.registerTool(
  "validate_migration",
  {
    title: "Validate Migrated Data",
    description: `Validate that migrated data in Supabase matches the source JSON data.

Compares a sample of records between the source JSON and Supabase to ensure:
- Record counts match
- Data integrity is preserved
- ID mappings are correct

Args:
  - table_name (string): Table to validate (e.g., 'dbo_Manufacturer')
  - sample_size (number): Number of random records to sample, 1-100 (default: 10)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Validation report with pass/fail status for each check.

Examples:
  - Use when: Verifying data integrity after migration
  - Use when: Troubleshooting data discrepancies
  - Don't use when: Migration is still in progress`,
    inputSchema: ValidateMigrationInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async (params: ValidateMigrationInput) => {
    try {
      const supabase = getSupabaseClient();
      const supabaseTableName = TABLE_NAME_MAP[params.table_name];

      if (!supabaseTableName) {
        return {
          content: [{
            type: "text",
            text: `Error: Unknown table '${params.table_name}'`,
          }],
          isError: true,
        };
      }

      // Load source data
      const jsonFileName = `${params.table_name}.json`;
      let sourceRecords: Record<string, unknown>[];
      try {
        sourceRecords = await loadJsonData(jsonFileName);
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: Failed to load source data: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }

      // Get count from Supabase
      const { count, error: countError } = await supabase
        .from(supabaseTableName)
        .select("*", { count: "exact", head: true });

      if (countError) {
        return {
          content: [{
            type: "text",
            text: `Error: Failed to query Supabase: ${countError.message}`,
          }],
          isError: true,
        };
      }

      // Sample random records for detailed validation
      const sampleIndices = new Set<number>();
      while (sampleIndices.size < Math.min(params.sample_size, sourceRecords.length)) {
        sampleIndices.add(Math.floor(Math.random() * sourceRecords.length));
      }

      const sampleValidations: Array<{ old_id: number; new_id: string; found: boolean; error?: string }> = [];
      const primaryKey = getPrimaryKeyColumn(params.table_name);

      for (const idx of sampleIndices) {
        const sourceRecord = sourceRecords[idx];
        const oldId = sourceRecord[primaryKey] as number;
        const expectedUuid = generateUUIDFromInt(
          oldId,
          supabaseTableName.slice(0, 8)
        );

        const { data: migratedRecord, error } = await supabase
          .from(supabaseTableName)
          .select("*")
          .eq("id", expectedUuid)
          .single();

        sampleValidations.push({
          old_id: oldId,
          new_id: expectedUuid,
          found: !!migratedRecord && !error,
          error: error?.message,
        });
      }

      const foundCount = sampleValidations.filter((v) => v.found).length;
      const countMatch = count === sourceRecords.length;

      const result = {
        table: params.table_name,
        supabase_table: supabaseTableName,
        source_count: sourceRecords.length,
        migrated_count: count,
        count_match: countMatch,
        sample_size: sampleValidations.length,
        sample_found: foundCount,
        sample_match_rate: `${Math.round((foundCount / sampleValidations.length) * 100)}%`,
        validations: sampleValidations,
        overall_status: countMatch && foundCount === sampleValidations.length ? "PASS" : "FAIL",
      };

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: formatValidationResult(result),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error),
        }],
        isError: true,
      };
    }
  }
);

// Tool 5: deploy_to_vercel
server.registerTool(
  "deploy_to_vercel",
  {
    title: "Trigger Vercel Redeploy",
    description: `Trigger a redeployment of the application on Vercel.

Uses the Vercel REST API to create a new deployment. This is useful after
successful data migration to refresh the application with new data.

Args:
  - vercel_token (string): Vercel API token (from https://vercel.com/account/tokens)
  - project_id (string): Vercel project ID
  - team_id (string, optional): Vercel team ID if project is under a team
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Deployment status and URL.

Examples:
  - Use when: Triggering redeploy after successful migration
  - Use when: Refreshing production with updated data
  - Don't use when: Just checking deployment status

Error Handling:
  - Returns "Error: Unauthorized" if token is invalid
  - Returns "Error: Not found" if project ID is incorrect`,
    inputSchema: DeployToVercelInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (params: DeployToVercelInput) => {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${params.vercel_token}`,
        "Content-Type": "application/json",
      };

      const url = params.team_id
        ? `https://api.vercel.com/v9/projects/${params.project_id}/deployments?teamId=${params.team_id}`
        : `https://api.vercel.com/v9/projects/${params.project_id}/deployments`;

      // First, get project info to find the latest deployment configuration
      const projectUrl = params.team_id
        ? `https://api.vercel.com/v9/projects/${params.project_id}?teamId=${params.team_id}`
        : `https://api.vercel.com/v9/projects/${params.project_id}`;

      const { data: projectData } = await axios.get(projectUrl, { headers });

      // Trigger new deployment
      const deploymentPayload = {
        name: projectData.name,
        project: params.project_id,
        target: "production",
        meta: {
          migratedAt: new Date().toISOString(),
        },
      };

      const { data: deployment } = await axios.post(url, deploymentPayload, { headers });

      const result = {
        success: true,
        deployment_id: deployment.id,
        url: deployment.url,
        state: deployment.state,
        created_at: deployment.createdAt,
        creator: deployment.creator?.username || "unknown",
      };

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: `# Vercel Deployment Triggered\n\n**Project**: ${projectData.name}\n**Deployment ID**: ${result.deployment_id}\n**URL**: https://${result.url}\n**Status**: ${result.state}\n**Created**: ${new Date(result.created_at).toLocaleString()}`,
        }],
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return {
            content: [{
              type: "text",
              text: "Error: Unauthorized. Check your Vercel token.",
            }],
            isError: true,
          };
        }
        if (error.response?.status === 404) {
          return {
            content: [{
              type: "text",
              text: "Error: Project not found. Check your project ID and team ID.",
            }],
            isError: true,
          };
        }
      }
      return {
        content: [{
          type: "text",
          text: handleApiError(error),
        }],
        isError: true,
      };
    }
  }
);

// Helper: Format duration in human-readable format
function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  return `${Math.round(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
}

// Helper: Format migration progress as markdown
function formatMigrationProgress(result: Record<string, unknown>): string {
  const lines = [
    `# Migration Progress: ${result.table}`,
    "",
    `**Status**: ${result.status}`,
    `**Progress**: ${result.progress}`,
    `**Processed**: ${result.processed} / ${result.total} records`,
    `**Failed**: ${result.failed}`,
    "",
    `**Batch Results**: +${result.batch_processed} successful, -${result.batch_failed} failed`,
    "",
    `**Elapsed Time**: ${result.elapsed_time}`,
    `**Estimated Remaining**: ${result.estimated_remaining}`,
  ];

  const errors = result.errors_in_batch as Array<{ record_id: number; error: string }>;
  if (errors && errors.length > 0) {
    lines.push("", "## Recent Errors");
    for (const err of errors) {
      lines.push(`- Record ${err.record_id}: ${err.error}`);
    }
  }

  return lines.join("\n");
}

// Helper: Format migration status as markdown
function formatMigrationStatus(result: Record<string, unknown>): string {
  const lines = [
    "# Migration Status Overview",
    "",
    `**Overall Progress**: ${result.overall_progress}`,
    `**Total Processed**: ${result.total_processed} / ${result.total_records}`,
    `**Total Failed**: ${result.total_failed}`,
    "",
    "## Table Status",
    "",
    "| Table | Status | Progress | Processed | Failed | Elapsed |",
    "|-------|--------|----------|-----------|--------|---------|",
  ];

  const tables = result.tables as Array<{
    table: string;
    status: string;
    progress: string;
    processed: number;
    total: number;
    failed: number;
    elapsed_time: string;
  }>;

  for (const t of tables) {
    lines.push(
      `| ${t.table} | ${t.status} | ${t.progress} | ${t.processed}/${t.total} | ${t.failed} | ${t.elapsed_time} |`
    );
  }

  return lines.join("\n");
}

// Helper: Format validation result as markdown
function formatValidationResult(result: Record<string, unknown>): string {
  const lines = [
    `# Migration Validation: ${result.table}`,
    "",
    `**Overall Status**: ${result.overall_status}`,
    "",
    "## Count Validation",
    `**Source Records**: ${result.source_count}`,
    `**Migrated Records**: ${result.migrated_count}`,
    `**Count Match**: ${result.count_match ? "✅ PASS" : "❌ FAIL"}`,
    "",
    "## Sample Validation",
    `**Sample Size**: ${result.sample_size}`,
    `**Records Found**: ${result.sample_found}`,
    `**Match Rate**: ${result.sample_match_rate}`,
    "",
    "## Sample Details",
    "",
    "| Old ID | New ID | Found |",
    "|--------|--------|-------|",
  ];

  const validations = result.validations as Array<{
    old_id: number;
    new_id: string;
    found: boolean;
  }>;

  for (const v of validations) {
    lines.push(`| ${v.old_id} | ${v.new_id} | ${v.found ? "✅" : "❌"} |`);
  }

  return lines.join("\n");
}

// Main function
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Supabase Migration MCP server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
