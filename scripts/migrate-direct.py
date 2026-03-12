#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Direct migration to Supabase PostgreSQL
"""

import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def apply_migration():
    # Get database URL
    db_url = os.getenv('SUPABASE_DB_URL')
    
    if not db_url or 'password' in db_url:
        print("[ERROR] SUPABASE_DB_URL is not configured correctly")
        print("\nGet Database Password from Supabase Dashboard:")
        print("1. Open https://csjvvyjpqpchkpaqoufr.supabase.co/project/_/settings/database")
        print("2. Click 'Show password' in Connection String section")
        print("3. Update SUPABASE_DB_URL in .env file:")
        print("   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.csjvvyjpqpchkpaqoufr.supabase.co:5432/postgres")
        sys.exit(1)
    
    # Find latest migration file
    migration_dir = Path("docs/base/migration_sql")
    migration_files = sorted([f for f in migration_dir.glob("migration_*.sql")], reverse=True)
    
    if not migration_files:
        print("[ERROR] Migration files not found")
        sys.exit(1)
    
    latest_migration = migration_files[0]
    print(f"[INFO] Found migration: {latest_migration.name}")
    
    # Read SQL
    sql_content = latest_migration.read_text(encoding='utf-8')
    print(f"[INFO] SQL size: {len(sql_content) / 1024:.2f} KB")
    
    # Connect to database
    print("\n[INFO] Connecting to Supabase PostgreSQL...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
        cursor = conn.cursor()
        
        print("[OK] Connected successfully")
        print("[INFO] Executing migration...\n")
        
        # Execute SQL
        cursor.execute(sql_content)
        conn.commit()
        
        print("[OK] Migration completed successfully!")
        print(f"[INFO] Data loaded from: {latest_migration.name}")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"[ERROR] PostgreSQL error: {e}")
        print("\nPossible solutions:")
        print("1. Check SUPABASE_DB_URL is correct")
        print("2. Ensure your IP is allowed in Supabase Dashboard -> Database -> IPv4")
        print("3. Try manual migration via SQL Editor")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
