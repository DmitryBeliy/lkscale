#!/usr/bin/env python3
import re

with open('supabase/migrations/ready/part_006_part001.sql', 'r') as f:
    content = f.read()

table_name = 'order_items'
insert_pattern = rf'INSERT INTO\s+{table_name}\s*\([^)]+\)\s*VALUES\s*(.+?)(?:;|$)'
matches = re.findall(insert_pattern, content, re.IGNORECASE | re.DOTALL)

print(f'Found {len(matches)} INSERT matches')

if matches:
    # Check first match content
    m = matches[0]
    print(f'First match length: {len(m)}')
    print(f'First 200 chars: {repr(m[:200])}')

# Try simpler pattern
simple_pattern = r'INSERT INTO order_items'
simple_matches = re.findall(simple_pattern, content, re.IGNORECASE)
print(f'Found {len(simple_matches)} simple matches')

# Check for semicolons in content
semicolons = content.count(';')
print(f'Semicolons in file: {semicolons}')
