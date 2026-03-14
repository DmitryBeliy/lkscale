#!/usr/bin/env python3
"""
Get table schema from information_schema
"""

import requests
import json

SUPABASE_URL = "https://onnncepenxxxfprqaodu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I"

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

def get_columns_via_rpc(table_name):
    """Get columns using RPC call to information_schema"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/get_columns"
    
    # First, let's try to query information_schema directly via REST
    # Using the fact that we can query any table via REST
    
    # Alternative: query a dummy row to get structure
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=0"
    
    try:
        response = requests.get(url, headers=HEADERS)
        print(f"\n{table_name}:")
        print(f"  Status: {response.status_code}")
        
        # PostgREST returns columns in header when limit=0
        # But we can also check OPTIONS
        options_resp = requests.options(url.replace("?select=*&limit=0", ""), headers=HEADERS)
        print(f"  OPTIONS Status: {options_resp.status_code}")
        
        if options_resp.status_code == 200:
            # Try to parse the output
            print(f"  OPTIONS Headers: {dict(options_resp.headers)}")
            
    except Exception as e:
        print(f"  Exception: {e}")

def main():
    print("Getting table schemas...")
    
    tables = ["order_items", "inventory_transactions"]
    
    for table in tables:
        get_columns_via_rpc(table)
    
    print("\n\nTo see actual columns, run this SQL in Supabase SQL Editor:")
    print("""
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_transactions'
ORDER BY ordinal_position;
    """)

if __name__ == "__main__":
    main()
