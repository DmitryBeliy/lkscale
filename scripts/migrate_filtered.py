#!/usr/bin/env python3
"""
Migration script that filters out columns that don't exist in the table
"""

import os
import re
import json
import time
import requests
from pathlib import Path

# Supabase configuration
SUPABASE_URL = "https://onnncepenxxxfprqaodu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I"

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

# Known columns that exist in tables
ORDER_ITEMS_COLUMNS = ['id', 'order_id', 'product_id', 'quantity', 'price', 'created_at', 'updated_at']
INVENTORY_COLUMNS = ['id', 'product_id', 'quantity', 'type', 'reference_id', 'notes', 'created_at', 'created_by']

def parse_insert_values(sql_content, table_name, allowed_columns):
    """Parse INSERT statements and filter columns"""
    records = []
    
    # Find all INSERT statements
    pattern = rf"INSERT INTO {table_name} \(([^)]+)\) VALUES\s+(.+?);"
    matches = re.findall(pattern, sql_content, re.DOTALL | re.IGNORECASE)
    
    for columns_str, values_block in matches:
        columns = [c.strip() for c in columns_str.split(",")]
        
        # Filter to only allowed columns
        valid_indices = []
        valid_columns = []
        for i, col in enumerate(columns):
            if col in allowed_columns:
                valid_indices.append(i)
                valid_columns.append(col)
        
        # Parse value tuples
        values_pattern = r"\(([^)]+(?:\([^)]*\)[^)]*)*)\)"
        value_matches = re.findall(values_pattern, values_block, re.DOTALL)
        
        for values_str in value_matches:
            values = parse_values(values_str)
            if not values:
                continue
            
            # Filter values to match valid columns
            filtered_values = [values[i] for i in valid_indices if i < len(values)]
            
            if len(filtered_values) == len(valid_columns):
                record = {}
                for col, val in zip(valid_columns, filtered_values):
                    record[col] = val
                records.append(record)
    
    return records

def parse_values(values_str):
    """Parse a values string into a list"""
    values = []
    current = ""
    in_quotes = False
    depth = 0
    
    for char in values_str:
        if char == "'" and (not current or current[-1] != "\\"):
            in_quotes = not in_quotes
            current += char
        elif char == "(" and not in_quotes:
            depth += 1
            current += char
        elif char == ")" and not in_quotes:
            depth -= 1
            current += char
        elif char == "," and not in_quotes and depth == 0:
            values.append(parse_value(current.strip()))
            current = ""
        else:
            current += char
    
    if current.strip():
        values.append(parse_value(current.strip()))
    
    return values

def parse_value(val):
    """Parse a single value"""
    val = val.strip()
    
    if val == "NULL" or val == "null":
        return None
    
    if val.startswith("'") and val.endswith("'"):
        val = val[1:-1].replace("''", "'")
        return val
    
    if "gen_random_uuid()" in val.lower():
        return None
    
    try:
        if "." in val:
            return float(val)
        return int(val)
    except ValueError:
        return val

def batch_insert(table, records, batch_size=500):
    """Insert records in batches via REST API"""
    total = len(records)
    inserted = 0
    
    for i in range(0, total, batch_size):
        batch = records[i:i + batch_size]
        
        # Remove None id - let DB generate
        for record in batch:
            if 'id' in record and record['id'] is None:
                del record['id']
        
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        
        try:
            response = requests.post(url, headers=HEADERS, json=batch, timeout=60)
            
            if response.status_code in [200, 201]:
                inserted += len(batch)
                print(f"  ✅ {table}: {inserted}/{total} ({inserted/total*100:.1f}%)")
            elif response.status_code == 409:
                # Conflict - record exists
                inserted += len(batch)
                print(f"  ⚠️  {table}: {inserted}/{total} (conflicts ignored)")
            else:
                print(f"  ⚠️  Batch {i}: HTTP {response.status_code}")
                print(f"     {response.text[:100]}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        time.sleep(0.05)
    
    return inserted

def count_records(table):
    """Count records in table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=count"
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return len(data) if isinstance(data, list) else "?"
    except:
        pass
    return "?"

def main():
    print("=" * 60)
    print("MIGRATION - Loading data (filtered columns)")
    print("=" * 60)
    
    # File mapping with allowed columns
    files = [
        ("supabase/migrations/ready/part_005_part001.sql", "order_items", ORDER_ITEMS_COLUMNS),
        ("supabase/migrations/ready/part_005_part002.sql", "order_items", ORDER_ITEMS_COLUMNS),
        ("supabase/migrations/ready/part_006_part001.sql", "inventory_transactions", INVENTORY_COLUMNS),
        ("supabase/migrations/ready/part_006_part002.sql", "inventory_transactions", INVENTORY_COLUMNS),
    ]
    
    for filepath, table, allowed_cols in files:
        print(f"\n📄 {filepath}")
        
        if not os.path.exists(filepath):
            print(f"  ❌ File not found")
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        records = parse_insert_values(content, table, allowed_cols)
        print(f"  📋 Found {len(records)} valid records")
        
        if records:
            inserted = batch_insert(table, records)
            print(f"  ✅ Inserted: {inserted}")
    
    print("\n" + "=" * 60)
    print("DONE")
    print("=" * 60)

if __name__ == "__main__":
    main()
