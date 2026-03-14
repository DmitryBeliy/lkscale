#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение миграции данных в Supabase через Python SDK
"""
import os
import sys
import json
from pathlib import Path
from supabase import create_client, Client

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

# Configuration
SUPABASE_URL = "https://onnncepenxxxfprqaodu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I"

MIGRATIONS_DIR = Path("supabase/migrations/ready")

def execute_sql_file(supabase: Client, filepath: Path) -> bool:
    """Execute SQL file via Supabase"""
    print(f"\n[FILE] Executing: {filepath.name}")
    
    try:
        sql = filepath.read_text(encoding='utf-8')
        
        # Execute via RPC
        result = supabase.rpc('exec_sql', {'query': sql}).execute()
        
        print(f"   [OK] Success")
        return True
        
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def load_categories(supabase: Client) -> bool:
    """Load categories data"""
    print("\n[LOAD] Loading categories...")
    
    categories = [
        {"id": "d4f1028a-1df2-5bd7-835f-6b8da08f44f3", "name": "Настенные газовые котлы", "sort_order": 1},
        {"id": "e72ed311-51be-5827-9f25-ca31bca97853", "name": "Напольные газовые котлы", "sort_order": 2},
        {"id": "29a952ee-445d-5680-83e4-a15983d8ab13", "name": "Электрические котлы", "sort_order": 3},
        {"id": "d807ca68-64ce-5694-91e7-be50e5e2cd37", "name": "Газовые колонки", "sort_order": 4},
        {"id": "9f9e8abb-f5dd-55d4-8d0c-b9f242815086", "name": "Счетчики", "sort_order": 5},
        {"id": "3439eb51-1ec7-50c7-9b63-1853e96ff667", "name": "Бойлеры", "sort_order": 6},
        {"id": "576cae10-ca1f-521e-9cc2-94fdc16c2237", "name": "Электрические водонагреватели", "sort_order": 7},
        {"id": "5fa14fca-7b88-581d-bf42-67221b39a425", "name": "Радиаторы", "sort_order": 8},
        {"id": "dde8de94-afde-5e5f-b7c2-005966c45494", "name": "Запасные части", "sort_order": 9},
        {"id": "8f3f38cd-260b-52d9-ab64-e3b180a7e4fb", "name": "Комплектующие для монтажа", "sort_order": 10},
        {"id": "b294967a-04ed-5156-838f-6f98a09c7ea7", "name": "Полипропилен", "sort_order": 11},
        {"id": "25516fc9-0c29-5ded-9946-316cbcf67078", "name": "Газовые плиты", "sort_order": 12},
        {"id": "e09476ce-d2b6-549e-83c6-c5d9d80d4a0e", "name": "Без категории", "sort_order": 13},
    ]
    
    try:
        for cat in categories:
            cat["color"] = "#3B82F6"
            cat["is_active"] = True
        
        result = supabase.table('categories').upsert(categories).execute()
        print(f"   [OK] Loaded {len(categories)} categories")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def test_connection(supabase: Client) -> bool:
    """Test connection to Supabase"""
    print("\n[TEST] Testing connection...")
    try:
        result = supabase.table('categories').select('count').limit(1).execute()
        print("   [OK] Connection successful")
        return True
    except Exception as e:
        print(f"   [ERROR] Connection failed: {e}")
        return False

def main():
    print("=" * 60)
    print("SUPABASE MIGRATION EXECUTION")
    print("=" * 60)
    
    # Create Supabase client
    print(f"\n[CONN] Connecting to: {SUPABASE_URL}")
    supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    
    # Test connection
    if not test_connection(supabase):
        print("\n[FAIL] Failed to connect to Supabase")
        return 1
    
    # Execute migration files
    print("\n" + "=" * 60)
    print("EXECUTING MIGRATION FILES")
    print("=" * 60)
    
    # First load categories
    load_categories(supabase)
    
    print("\n[DONE] Migration completed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
