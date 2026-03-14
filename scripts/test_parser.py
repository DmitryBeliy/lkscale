#!/usr/bin/env python3
"""Test script for SQL parser"""

import re

def parse_insert_values(sql_content: str, table_name: str):
    """Parse SQL content and extract INSERT values for specified table."""
    rows = []

    # Pattern to match INSERT INTO table_name (columns) VALUES
    insert_pattern = rf"INSERT INTO\s+{table_name}\s*\([^)]+\)\s*VALUES"

    # Split by INSERT statements
    parts = re.split(insert_pattern, sql_content, flags=re.IGNORECASE)

    print(f"Found {len(parts)} parts after splitting by INSERT")

    if len(parts) <= 1:
        print("No INSERT statements found for this table")
        return rows

    for i, part in enumerate(parts[1:], 1):
        print(f"\nProcessing part {i} (length: {len(part)} chars)")

        # Look for value tuples - they start with ( and contain UUIDs
        # Pattern matches: ('uuid', ... )
        values_pattern = r"\(\s*'[a-f0-9-]{36}'[^)]*\)"

        matches = re.findall(values_pattern, part, re.DOTALL)
        print(f"Found {len(matches)} value tuples")

        for j, match in enumerate(matches[:3]):  # Show first 3
            print(f"  Match {j+1}: {match[:100]}...")

    return rows


# Test with actual file
print("Reading part_006_part001.sql...")
with open('supabase/migrations/ready/part_006_part001.sql', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File size: {len(content)} characters")
print(f"Contains 'INSERT INTO order_items': {'INSERT INTO order_items' in content}")

# Parse
rows = parse_insert_values(content, 'order_items')
print(f"\nTotal rows parsed: {len(rows)}")
