#!/usr/bin/env python3
"""
Check table schema and migrate data accordingly
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

def get_table_columns(table_name):
    """Get columns from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=1"
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                return list(data[0].keys())
    except Exception as e:
        print(f"Error: {e}")
    return []

def main():
    print("Checking table schemas...")
    
    order_items_cols = get_table_columns("order_items")
    print(f"\norder_items columns: {order_items_cols}")
    
    inventory_cols = get_table_columns("inventory_transactions")
    print(f"inventory_transactions columns: {inventory_cols}")
    
    # Check if cost_price exists
    if "cost_price" in order_items_cols:
        print("\n✅ cost_price column EXISTS")
    else:
        print("\n❌ cost_price column NOT FOUND")
        print("Available columns:", order_items_cols)

if __name__ == "__main__":
    main()
