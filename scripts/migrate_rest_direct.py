#!/usr/bin/env python3
"""
Direct REST API Migration Script
Loads data via REST API (POST /rest/v1/table)
"""

import requests
import json
import re
import time
import sys
from pathlib import Path

# Configuration
SUPABASE_URL = "https://onnncepenxxxfprqaodu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I"

headers = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "apikey": SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
    "Prefer": "resolution=ignore-duplicates,return=minimal"
}

def log_step(msg):
    print(f"\n\033[1;36m▶ {msg}\033[0m")

def log_info(msg):
    print(f"\033[36mℹ\033[0m {msg}")

def log_success(msg):
    print(f"\033[32m✓\033[0m {msg}")

def log_warn(msg):
    print(f"\033[33m⚠\033[0m {msg}")

def log_error(msg):
    print(f"\033[31m✗\033[0m {msg}")

def insert_batch(table, records):
    """Insert records via REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    
    try:
        response = requests.post(url, headers=headers, json=records, timeout=30)
        if response.status_code in [200, 201, 204]:
            return {"success": True, "count": len(records)}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text[:200]}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def parse_insert_sql(filepath):
    """Parse SQL INSERT statements and extract records"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    records = []
    table_name = None
    columns = []
    
    # Find INSERT statement
    insert_match = re.search(r'INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES', content, re.IGNORECASE)
    if insert_match:
        table_name = insert_match.group(1)
        columns = [c.strip().strip('"') for c in insert_match.group(2).split(',')]
    
    # Find all value rows
    value_pattern = r'\(([^)]+)\)(?:,|;)?'
    values_section = re.search(r'VALUES\s*(.+)', content, re.DOTALL | re.IGNORECASE)
    
    if values_section:
        values_text = values_section.group(1)
        rows = re.findall(value_pattern, values_text)
        
        for row in rows:
            values = []
            current = ""
            in_quote = False
            quote_char = None
            
            for char in row:
                if char in ["'", '"'] and not in_quote:
                    in_quote = True
                    quote_char = char
                elif char == quote_char and in_quote:
                    in_quote = False
                    quote_char = None
                elif char == ',' and not in_quote:
                    values.append(current.strip())
                    current = ""
                    continue
                current += char
            values.append(current.strip())
            
            # Create record
            record = {}
            for i, col in enumerate(columns):
                if i < len(values):
                    val = values[i].strip()
                    
                    # Handle NULL
                    if val.upper() == 'NULL':
                        record[col] = None
                    # Handle NOW()
                    elif val.upper() == 'NOW()' or val == "'NOW()'")
                        record[col] = time.strftime('%Y-%m-%dT%H:%M:%SZ')
                    # Handle booleans
                    elif val.upper() == 'TRUE':
                        record[col] = True
                    elif val.upper() == 'FALSE':
                        record[col] = False
                    # Handle integers
                    elif re.match(r'^-?\d+$', val):
                        record[col] = int(val)
                    # Handle floats
                    elif re.match(r'^-?\d+\.\d+$', val):
                        record[col] = float(val)
                    # Handle quoted strings
                    elif (val.startswith("'") and val.endswith("'")) or \
                         (val.startswith('"') and val.endswith('"')):
                        record[col] = val[1:-1]
                    else:
                        record[col] = val
            
            records.append(record)
    
    return table_name, records

def load_sql_file(filename, batch_size=200):
    """Load SQL file and insert data"""
    filepath = Path(__file__).parent.parent / 'supabase' / 'migrations' / 'ready' / filename
    
    if not filepath.exists():
        log_warn(f"File not found: {filepath}")
        return 0
    
    size_kb = filepath.stat().st_size / 1024
    log_step(f"Loading {filename} ({size_kb:.2f} KB)")
    
    table_name, records = parse_insert_sql(str(filepath))
    
    if not records:
        log_warn("No records found")
        return 0
    
    log_info(f"Table: {table_name}, Records: {len(records)}")
    
    success_count = 0
    fail_count = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(records) + batch_size - 1) // batch_size
        
        sys.stdout.write(f"\033[34m  Batch {batch_num}/{total_batches}...\033[0m\r")
        sys.stdout.flush()
        
        result = insert_batch(table_name, batch)
        
        if result["success"]:
            success_count += result["count"]
        else:
            fail_count += len(batch)
            if batch_num <= 2:
                print()
                log_warn(f"Batch {batch_num} error: {result['error'][:100]}")
        
        # Rate limiting
        if i + batch_size < len(records):
            time.sleep(0.05)
    
    print()
    log_success(f"Inserted {success_count}/{len(records)} records")
    if fail_count > 0:
        log_warn(f"Failed: {fail_count} records")
    
    return success_count

def main():
    log_step("Starting REST API Migration")
    log_info(f"Project: {SUPABASE_URL}")
    
    # Load data files
    files = [
        "part_005_part001.sql",
        "part_005_part002.sql",
        "part_006_part001.sql",
        "part_006_part002.sql"
    ]
    
    total_records = 0
    
    for file in files:
        count = load_sql_file(file)
        total_records += count
        time.sleep(0.5)
    
    log_step("Migration completed")
    log_success(f"Total records inserted: {total_records}")

if __name__ == "__main__":
    main()
