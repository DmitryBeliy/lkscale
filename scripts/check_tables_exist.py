#!/usr/bin/env python3
"""
Check if tables exist and their structure
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

def check_table(table_name):
    """Check if table exists by trying to get one row"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=1"
    try:
        response = requests.get(url, headers=HEADERS)
        print(f"\n{table_name}:")
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"  Columns: {list(data[0].keys())}")
                print(f"  Sample row: {json.dumps(data[0], indent=2)[:200]}...")
            else:
                print(f"  Table exists but is EMPTY")
        else:
            print(f"  Error: {response.text[:200]}")
            
    except Exception as e:
        print(f"  Exception: {e}")

def main():
    print("Checking tables...")
    
    tables = [
        "order_items",
        "inventory_transactions", 
        "orders",
        "products",
        "categories",
        "suppliers"
    ]
    
    for table in tables:
        check_table(table)

if __name__ == "__main__":
    main()
