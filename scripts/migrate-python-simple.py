#!/usr/bin/env python3
"""
Supabase Migration using Python with direct PostgreSQL connection
Requires: SUPABASE_DB_PASSWORD environment variable
"""

import os
import sys
import time
import re
from pathlib import Path

# Try to import psycopg2
try:
    import psycopg2
except ImportError:
    print("Error: psycopg2 not installed. Install with: pip install psycopg2-binary")
    sys.exit(1)

# Configuration
MIGRATIONS_DIR = Path(__file__).parent.parent / "supabase" / "migrations" / "ready"
BATCH_SIZE = 1000
MAX_RETRIES = 3
RETRY_DELAY = 2

# Database connection
PROJECT_REF = "onnncepenxxxfprqaodu"
DB_HOST = f"db.{PROJECT_REF}.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD')

def get_connection():
    """Get database connection"""
    if not DB_PASSWORD:
        print("Error: Database password not set.")
        print("Set SUPABASE_DB_PASSWORD environment variable.")
        print("You can find this in Supabase Dashboard -> Database -> Connection String")
        sys.exit(1)

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )
        return conn
    except Exception as e:
        print(f"Error: Connection failed: {e}")
        sys.exit(1)

def execute_sql(conn, sql, filename=""):
    """Execute SQL with retry logic"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with conn.cursor() as cur:
                cur.execute(sql)
                conn.commit()
                return True, None
        except Exception as e:
            conn.rollback()
            if attempt < MAX_RETRIES:
                print(f"   Warning: Attempt {attempt} failed, retrying...")
                time.sleep(RETRY_DELAY * attempt)
            else:
                return False, str(e)
    return False, "Max retries exceeded"

def split_insert_batches(sql):
    """Split INSERT statements into batches"""
    batches = []
    lines = sql.split('\n')
    current_batch = []
    in_insert = False
    table_name = ""
    columns = ""

    for line in lines:
        line = line.strip()

        # Detect INSERT INTO
        insert_match = re.match(r'INSERT INTO\s+(\w+)\s*\(([^)]+)\)', line, re.IGNORECASE)
        if insert_match:
            in_insert = True
            table_name = insert_match.group(1)
            columns = insert_match.group(2)
            current_batch = []
            continue

        # Skip VALUES line
        if in_insert and line.upper().startswith('VALUES'):
            continue

        # Collect value rows
        if in_insert and line.startswith('('):
            clean_line = line.rstrip(',').rstrip(';')
            current_batch.append(clean_line)

            # Create batch when size reached
            if len(current_batch) >= BATCH_SIZE:
                values_clause = ',\n'.join(current_batch)
                batches.append(f"INSERT INTO {table_name} ({columns}) VALUES\n{values_clause};")
                current_batch = []
            continue

        # End of INSERT
        if in_insert and line.endswith(';'):
            if current_batch:
                values_clause = ',\n'.join(current_batch)
                batches.append(f"INSERT INTO {table_name} ({columns}) VALUES\n{values_clause};")
            in_insert = False
            current_batch = []

    # Handle remaining values
    if current_batch:
        values_clause = ',\n'.join(current_batch)
        batches.append(f"INSERT INTO {table_name} ({columns}) VALUES\n{values_clause};")

    return batches

def has_large_inserts(sql, threshold_kb=200):
    """Check if SQL contains large INSERT statements"""
    size_kb = len(sql.encode('utf-8')) / 1024
    return size_kb > threshold_kb and 'INSERT INTO' in sql.upper()

def execute_file(conn, filename):
    """Execute a single SQL file"""
    filepath = MIGRATIONS_DIR / filename
    sql = filepath.read_text(encoding='utf-8')
    size_kb = len(sql.encode('utf-8')) / 1024

    print(f"\nProcessing: {filename}")
    print(f"   Size: {size_kb:.2f} KB")

    # Check if file needs batching
    if has_large_inserts(sql):
        print(f"   Large file detected, splitting into batches...")
        batches = split_insert_batches(sql)

        if not batches:
            # No INSERT batches found, execute as-is
            print(f"   Executing as single statement...")
            success, error = execute_sql(conn, sql, filename)
            if not success:
                print(f"   Failed: {error}")
                return False
        else:
            print(f"   Split into {len(batches)} batches")

            for i, batch in enumerate(batches, 1):
                print(f"   Batch {i}/{len(batches)}...", end='', flush=True)
                success, error = execute_sql(conn, batch, filename)

                if success:
                    print(f" OK")
                else:
                    print(f" Failed: {error}")
                    return False

                # Small delay between batches
                if i < len(batches):
                    time.sleep(0.1)
    else:
        # Small file, execute as-is
        print(f"   Executing...")
        success, error = execute_sql(conn, sql, filename)
        if not success:
            print(f"   Failed: {error}")
            return False

    print(f"   Completed")
    return True

def verify_migration(conn):
    """Verify migration results"""
    print(f"\nVerifying migration results...")

    tables = [
        ('products', 'SELECT COUNT(*) FROM products'),
        ('orders', 'SELECT COUNT(*) FROM orders'),
        ('order_items', 'SELECT COUNT(*) FROM order_items'),
        ('inventory_transactions', 'SELECT COUNT(*) FROM inventory_transactions'),
    ]

    for table_name, query in tables:
        try:
            with conn.cursor() as cur:
                cur.execute(query)
                count = cur.fetchone()[0]
                print(f"   {table_name}: {count} records")
        except Exception as e:
            print(f"   {table_name}: Error - {e}")

def main():
    print("=" * 60)
    print("Supabase Migration with Python + PostgreSQL")
    print("=" * 60)

    # Test connection
    print("\nTesting connection...")
    conn = get_connection()
    print("Connection successful")

    # Migration files in order
    migration_files = [
        '00_setup.sql',
        'part_001.sql',
        'part_002.sql',
        'part_003_part001.sql',
        'part_003_part002.sql',
        'part_004_part001.sql',
        'part_004_part002.sql',
        'part_005_part001.sql',
        'part_005_part002.sql',
        'part_006_part001.sql',
        'part_006_part002.sql',
    ]

    success_count = 0
    fail_count = 0

    for file in migration_files:
        success = execute_file(conn, file)
        if success:
            success_count += 1
        else:
            fail_count += 1
            print(f"\nMigration stopped due to error in {file}")
            break

    # Summary
    print("\n" + "=" * 60)
    print("Migration Summary")
    print("=" * 60)
    print(f"Successful: {success_count}")
    print(f"Failed: {fail_count}")

    # Verify results
    verify_migration(conn)

    conn.close()

    if fail_count > 0:
        sys.exit(1)

if __name__ == '__main__':
    main()
