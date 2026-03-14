#!/usr/bin/env python3
"""
Final migration script for loading order_items and inventory_transactions data.
Connects directly to PostgreSQL via psycopg2.
"""

import os
import sys
import re
import argparse
from typing import List, Tuple, Optional, Dict
from pathlib import Path

# Try to import psycopg2, fallback to REST API if not available
try:
    import psycopg2
    from psycopg2.extras import execute_values
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    print("Warning: psycopg2 not available. Will use REST API fallback.")

# Configuration
DB_HOST = "db.onnncepenxxxfprqaodu.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"

# SQL Files to process
SQL_FILES = {
    "order_items": [
        "supabase/migrations/ready/part_005_part001.sql",
        "supabase/migrations/ready/part_005_part002.sql",
        "supabase/migrations/ready/part_006_part001.sql",
        "supabase/migrations/ready/part_006_part002.sql",
    ],
    "inventory_transactions": [
        "supabase/migrations/ready/part_008_part001.sql",
        "supabase/migrations/ready/part_009.sql",
    ]
}

# ALTER TABLE statements for order_items
ALTER_TABLE_QUERIES = [
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;",
]


class MigrationProgress:
    """Track migration progress"""
    def __init__(self):
        self.total_rows = 0
        self.processed_rows = 0
        self.current_file = ""
        self.current_table = ""

    def set_file(self, filename: str, table: str):
        self.current_file = filename
        self.current_table = table
        print(f"\n[FILE] Processing {filename} -> {table}")

    def add_rows(self, count: int):
        self.total_rows += count

    def update(self, processed: int):
        self.processed_rows += processed
        percent = (self.processed_rows / self.total_rows * 100) if self.total_rows > 0 else 0
        print(f"  Progress: {self.processed_rows}/{self.total_rows} rows ({percent:.1f}%)", end="\r")

    def finish(self):
        print()  # New line after progress


class SQLParser:
    """Parse SQL INSERT statements and extract values"""

    @staticmethod
    def parse_insert_values(sql_content: str, table_name: str) -> List[Tuple]:
        """
        Parse SQL content and extract INSERT values for specified table.
        Handles multiple INSERT statements in one file.
        """
        rows = []

        # Pattern to match INSERT INTO table_name (columns) VALUES
        # Capture everything after VALUES until ; or end of string
        insert_pattern = rf"INSERT INTO\s+{table_name}\s*\([^)]+\)\s*VALUES\s*(.+?)(?:;|$)"

        matches = re.findall(insert_pattern, sql_content, re.IGNORECASE | re.DOTALL)

        for match in matches:
            # Parse value tuples from the match
            # Tuples look like: ('uuid', 'uuid', ..., value, 'now()'),
            # Need to handle nested parentheses and commas within strings
            tuples = SQLParser._extract_tuples(match)

            for tuple_str in tuples:
                row = SQLParser._parse_tuple(tuple_str)
                if row:
                    rows.append(row)

        return rows

    @staticmethod
    def _extract_tuples(values_section: str) -> List[str]:
        """Extract individual tuple strings from VALUES section"""
        tuples = []
        depth = 0
        start = -1

        for i, char in enumerate(values_section):
            if char == '(' and (i == 0 or values_section[i-1] != "'"):
                if depth == 0:
                    start = i
                depth += 1
            elif char == ')' and (i == 0 or values_section[i-1] != "'"):
                depth -= 1
                if depth == 0 and start != -1:
                    tuple_str = values_section[start:i+1]
                    tuples.append(tuple_str)
                    start = -1

        return tuples

    @staticmethod
    def _parse_tuple(tuple_str: str) -> Optional[Tuple]:
        """Parse a single tuple string like ('value1', 'value2', NULL, 123)"""
        # Remove outer parentheses
        if not (tuple_str.startswith('(') and tuple_str.endswith(')')):
            return None

        content = tuple_str[1:-1].strip()
        if not content:
            return None

        values = []
        i = 0
        content_len = len(content)

        while i < content_len:
            # Skip whitespace
            while i < content_len and content[i] in ' \t\n\r':
                i += 1

            if i >= content_len:
                break

            if content[i] == "'":
                # String value (could be UUID, text, or 'now()')
                j = i + 1
                while j < content_len:
                    if content[j] == "'":
                        # Check if escaped ''
                        if j + 1 < content_len and content[j + 1] == "'":
                            j += 2
                        else:
                            break
                    else:
                        j += 1

                if j < content_len:
                    value = content[i+1:j].replace("''", "'")
                    values.append(value)
                    i = j + 1
                else:
                    break
            elif content[i:i+4].upper() == 'NULL':
                values.append(None)
                i += 4
            elif content[i:i+6].lower() == 'now()':
                # Special case for now() - we'll handle this in the DB
                values.append('now()')
                i += 6
            elif content[i].isdigit() or (content[i] == '-' and i + 1 < content_len and content[i+1].isdigit()):
                # Number (integer or float, possibly negative)
                j = i + 1
                while j < content_len and (content[j].isdigit() or content[j] == '.'):
                    j += 1
                num_str = content[i:j]
                try:
                    if '.' in num_str:
                        values.append(float(num_str))
                    else:
                        values.append(int(num_str))
                except ValueError:
                    values.append(None)
                i = j
            elif content[i] == ',':
                i += 1
            else:
                # Unknown character, skip
                i += 1

        return tuple(values) if values else None


class PostgreSQLMigrator:
    """Handle PostgreSQL migration"""

    def __init__(self, password: str):
        self.password = password
        self.conn = None
        self.cursor = None

    def connect(self):
        """Connect to PostgreSQL"""
        print(f"\n[CONN] Connecting to PostgreSQL at {DB_HOST}...")
        try:
            self.conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=self.password,
                sslmode='require'
            )
            self.cursor = self.conn.cursor()
            print("[OK] Connected successfully")
            return True
        except Exception as e:
            print(f"[ERROR] Connection failed: {e}")
            return False

    def close(self):
        """Close connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def execute_alter_table(self):
        """Execute ALTER TABLE statements"""
        print("\n[ALTER] Executing ALTER TABLE statements...")
        for query in ALTER_TABLE_QUERIES:
            try:
                print(f"  {query[:60]}...")
                self.cursor.execute(query)
                self.conn.commit()
            except Exception as e:
                print(f"  Warning: {e}")
                self.conn.rollback()
        print("[OK] ALTER TABLE completed")

    def count_existing_rows(self, table: str) -> int:
        """Count existing rows in table"""
        try:
            self.cursor.execute(f"SELECT COUNT(*) FROM {table}")
            return self.cursor.fetchone()[0]
        except Exception as e:
            print(f"  Warning: Could not count rows: {e}")
            return 0

    def insert_rows(self, table: str, rows: List[Tuple], progress: MigrationProgress):
        """Insert rows using executemany"""
        if not rows:
            return 0

        # Get column count from first row
        column_count = len(rows[0])

        # Build INSERT query with placeholders
        placeholders = ','.join(['%s'] * column_count)

        # Convert 'now()' strings to SQL function
        # We'll use a special value and handle it in the query
        processed_rows = []
        for row in rows:
            new_row = []
            for val in row:
                if val == 'now()':
                    new_row.append(None)  # Use None and let DB handle default
                else:
                    new_row.append(val)
            processed_rows.append(tuple(new_row))

        query = f"INSERT INTO {table} VALUES ({placeholders})"

        # Process in batches for better performance and progress tracking
        batch_size = 1000
        inserted = 0

        for i in range(0, len(processed_rows), batch_size):
            batch = processed_rows[i:i + batch_size]
            try:
                self.cursor.executemany(query, batch)
                self.conn.commit()
                inserted += len(batch)
                progress.update(len(batch))
            except Exception as e:
                print(f"\n  Error inserting batch: {e}")
                self.conn.rollback()
                # Try inserting one by one to skip problematic rows
                for row in batch:
                    try:
                        self.cursor.execute(query, row)
                        self.conn.commit()
                        inserted += 1
                        progress.update(1)
                    except Exception as e2:
                        self.conn.rollback()
                        # Skip this row silently

        return inserted


class RESTAPIMigrator:
    """Fallback migrator using REST API"""

    def __init__(self, service_role_key: str):
        self.service_role_key = service_role_key
        self.base_url = "https://onnncepenxxxfprqaodu.supabase.co/rest/v1"

    def execute_alter_table(self):
        """Cannot execute ALTER TABLE via REST API"""
        print("[WARN] Cannot execute ALTER TABLE via REST API")
        print("   Please run ALTER TABLE manually in SQL Editor:")
        for query in ALTER_TABLE_QUERIES:
            print(f"   {query}")

    def insert_rows(self, table: str, rows: List[Tuple], progress: MigrationProgress):
        """Insert rows via REST API (limited functionality)"""
        print(f"\n[WARN] REST API mode - limited to basic columns only")
        print(f"   Skipping {len(rows)} rows for {table}")
        print(f"   Please use psycopg2 for full migration")
        return 0


def count_rows_in_file(filepath: str, table: str) -> int:
    """Count approximate number of rows in SQL file for progress bar"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Count UUID patterns which indicate data rows
        pattern = r"'[a-f0-9-]{36}'"
        matches = re.findall(pattern, content)
        # Each row typically has 3 UUIDs for order_items or 2 for inventory_transactions
        if table == "order_items":
            return len(matches) // 3
        else:
            return len(matches) // 2
    except Exception:
        return 0


def main():
    parser = argparse.ArgumentParser(description='Migrate data to PostgreSQL')
    parser.add_argument('--password', '-p', help='Database password')
    parser.add_argument('--service-role-key', '-k', help='Service role key for REST API fallback')
    parser.add_argument('--skip-alter', action='store_true', help='Skip ALTER TABLE statements')
    parser.add_argument('--table', '-t', choices=['order_items', 'inventory_transactions', 'both'],
                       default='both', help='Which table to migrate')
    parser.add_argument('--dry-run', action='store_true', help='Parse only, do not insert')
    args = parser.parse_args()

    # Get password
    password = args.password or os.environ.get('SUPABASE_DB_PASSWORD')
    if not password and PSYCOPG2_AVAILABLE and not args.dry_run:
        print("Error: Database password required. Use --password or set SUPABASE_DB_PASSWORD env var")
        sys.exit(1)

    # Get service role key for fallback
    service_role_key = args.service_role_key or os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    # Initialize migrator
    migrator = None
    if PSYCOPG2_AVAILABLE and password and not args.dry_run:
        migrator = PostgreSQLMigrator(password)
        if not migrator.connect():
            if service_role_key:
                print("\n[WARN] Falling back to REST API...")
                migrator = RESTAPIMigrator(service_role_key)
            else:
                sys.exit(1)
    elif service_role_key and not args.dry_run:
        migrator = RESTAPIMigrator(service_role_key)
    elif args.dry_run:
        print("\n[DRY RUN] Parsing only, no database connection")
        migrator = None
    else:
        print("Error: Either psycopg2 with password or service_role_key required")
        sys.exit(1)

    try:
        # Execute ALTER TABLE
        if migrator and not args.skip_alter:
            migrator.execute_alter_table()

        # Determine which tables to process
        tables_to_process = []
        if args.table in ['order_items', 'both']:
            tables_to_process.append('order_items')
        if args.table in ['inventory_transactions', 'both']:
            tables_to_process.append('inventory_transactions')

        # Process each table
        progress = MigrationProgress()

        for table in tables_to_process:
            print(f"\n{'='*60}")
            print(f"[TABLE] Processing: {table}")
            print(f"{'='*60}")

            # Count existing rows
            if migrator and isinstance(migrator, PostgreSQLMigrator):
                existing = migrator.count_existing_rows(table)
                print(f"Existing rows: {existing}")

            # Count total rows first
            total_rows = 0
            for filepath in SQL_FILES[table]:
                if os.path.exists(filepath):
                    total_rows += count_rows_in_file(filepath, table)

            if total_rows > 0:
                progress.total_rows = total_rows
                print(f"Estimated rows to process: {total_rows}")

            # Process each file
            all_rows = []
            for filepath in SQL_FILES[table]:
                if not os.path.exists(filepath):
                    print(f"  [WARN] File not found: {filepath}")
                    continue

                progress.set_file(filepath, table)

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Parse rows
                    rows = SQLParser.parse_insert_values(content, table)
                    if rows:
                        print(f"  Parsed {len(rows)} rows")
                        all_rows.extend(rows)
                    else:
                        print(f"  No data rows found")

                except Exception as e:
                    print(f"  Error reading file: {e}")

            # Insert all rows
            if all_rows:
                print(f"\n[INSERT] Total rows to insert: {len(all_rows)}")

                if args.dry_run:
                    print("  (Dry run - skipping insertion)")
                    print(f"  First row sample: {all_rows[0]}")
                    print(f"  Row column count: {len(all_rows[0])}")
                else:
                    print(f"\n[INSERT] Inserting {len(all_rows)} rows into {table}...")
                    inserted = migrator.insert_rows(table, all_rows, progress)
                    progress.finish()
                    print(f"[OK] Inserted {inserted} rows into {table}")

                    # Verify
                    if isinstance(migrator, PostgreSQLMigrator):
                        final_count = migrator.count_existing_rows(table)
                        print(f"[COUNT] Total rows in {table}: {final_count}")
            else:
                print(f"\n[WARN] No rows to insert for {table}")

        print(f"\n{'='*60}")
        print("[DONE] Migration completed!")
        print(f"{'='*60}")

    finally:
        if migrator and isinstance(migrator, PostgreSQLMigrator):
            migrator.close()


if __name__ == '__main__':
    main()
