#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Полная миграция данных из бэкапа в Supabase
"""
import sys
import json
import uuid
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client

sys.stdout.reconfigure(encoding='utf-8')

# Configuration
SUPABASE_URL = "https://onnncepenxxxfprqaodu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I"

DATA_DIR = Path("docs/base/extracted_data")
NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

# Status mappings
ORDER_STATUS_MAP = {0: 'pending', 1: 'completed', 2: 'cancelled', 3: 'refunded', 4: 'processing'}
PAYMENT_TYPE_MAP = {0: 'cash', 1: 'card', 2: 'transfer', 3: 'online'}

def int_to_uuid(entity_type: str, old_id: int) -> str:
    """Convert int ID to UUID v5"""
    key = f"{entity_type}_{old_id}"
    return str(uuid.uuid5(NAMESPACE, key))

def load_json(filename: str):
    """Load JSON file"""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        print(f"[WARN] File not found: {filepath}")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def migrate_categories(supabase: Client) -> bool:
    """Migrate categories"""
    print("\n[1/6] Migrating categories...")
    data = load_json("dbo_ProductCategory.json")
    
    categories = []
    for item in data:
        categories.append({
            "id": int_to_uuid('category', item['ProductCategoryId']),
            "name": item['Name'],
            "color": "#3B82F6",
            "sort_order": item['ProductCategoryId'],
            "is_active": True
        })
    
    try:
        result = supabase.table('categories').upsert(categories).execute()
        print(f"   [OK] Migrated {len(categories)} categories")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def migrate_suppliers(supabase: Client) -> bool:
    """Migrate suppliers and manufacturers"""
    print("\n[2/6] Migrating suppliers & manufacturers...")
    suppliers_data = load_json("dbo_Supplier.json")
    manufacturers_data = load_json("dbo_Manufacturer.json")
    
    suppliers = []
    
    # Manufacturers
    for item in manufacturers_data:
        suppliers.append({
            "id": int_to_uuid('manufacturer', item['ManufacturerId']),
            "name": item['Name'],
            "type": "manufacturer",
            "is_active": True
        })
    
    # Suppliers
    for item in suppliers_data:
        suppliers.append({
            "id": int_to_uuid('supplier', item['SupplierId']),
            "name": item['Name'],
            "type": "supplier",
            "is_active": True
        })
    
    try:
        # Insert in batches
        batch_size = 50
        for i in range(0, len(suppliers), batch_size):
            batch = suppliers[i:i+batch_size]
            result = supabase.table('suppliers').upsert(batch).execute()
        print(f"   [OK] Migrated {len(suppliers)} suppliers/manufacturers")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def create_missing_tables(supabase: Client):
    """Create missing tables"""
    print("\n[SETUP] Creating missing tables...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY,
        order_id UUID REFERENCES orders(id),
        product_id UUID REFERENCES products(id),
        product_name TEXT,
        product_sku TEXT,
        quantity INTEGER DEFAULT 0,
        unit_price DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS inventory_transactions (
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id),
        supplier_id UUID REFERENCES suppliers(id),
        transaction_type TEXT,
        quantity INTEGER DEFAULT 0,
        unit_cost DECIMAL(10,2) DEFAULT 0,
        total_cost DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow all" ON order_items;
    DROP POLICY IF EXISTS "Allow all" ON inventory_transactions;
    
    CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow all" ON inventory_transactions FOR ALL USING (true) WITH CHECK (true);
    """
    
    try:
        result = supabase.rpc('exec_sql', {'query': sql}).execute()
        print("   [OK] Tables created")
    except Exception as e:
        print(f"   [WARN] {e}")

def migrate_products(supabase: Client) -> bool:
    """Migrate products"""
    print("\n[3/6] Migrating products...")
    data = load_json("dbo_Product.json")
    
    # Track seen SKUs to handle duplicates
    seen_skus = {}
    products = []
    skipped = 0
    
    for item in data:
        category_id = None
        if item.get('CategoryId'):
            category_id = int_to_uuid('category', item['CategoryId'])
        
        manufacturer_id = None
        if item.get('ManufacturerId'):
            manufacturer_id = int_to_uuid('manufacturer', item['ManufacturerId'])
        
        price = 0
        if item.get('PriceTypeValue'):
            try:
                price = float(item['PriceTypeValue'])
            except:
                price = 0
        
        sku = item.get('VendorCode')
        # Handle duplicate SKUs
        if sku:
            if sku in seen_skus:
                sku = f"{sku}-{item['ProductId']}"
                skipped += 1
            seen_skus[item.get('VendorCode')] = True
        
        products.append({
            "id": int_to_uuid('product', item['ProductId']),
            "category_id": category_id,
            "manufacturer_id": manufacturer_id,
            "name": item['Name'][:255] if item.get('Name') else 'Unknown',
            "sku": sku,
            "barcode": item.get('ManufacturerBarcodes') if item.get('ManufacturerBarcodes') else None,
            "description": item.get('Description'),
            "price": price,
            "cost_price": 0,
            "min_stock": item.get('MinStock') or 0,
            "stock": 0,
            "unit": "шт",
            "is_active": not item.get('IsArchive', False),
        })
    
    try:
        # Insert in batches
        batch_size = 100
        for i in range(0, len(products), batch_size):
            batch = products[i:i+batch_size]
            result = supabase.table('products').upsert(batch).execute()
        print(f"   [OK] Migrated {len(products)} products ({skipped} duplicates handled)")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def migrate_orders(supabase: Client) -> bool:
    """Migrate orders"""
    print("\n[4/6] Migrating orders...")
    data = load_json("dbo_Order.json")
    
    orders = []
    for item in data:
        status = ORDER_STATUS_MAP.get(item.get('Status', 0), 'pending')
        payment = PAYMENT_TYPE_MAP.get(item.get('PaymentType', 0), 'cash')
        
        created_date = item.get('CreatedDateUtc')
        if created_date:
            created_date = created_date.replace(' ', 'T')
            if '.' not in created_date:
                created_date += '.000'
            created_date += '+00:00'
        else:
            created_date = datetime.now().isoformat()
        
        orders.append({
            "id": int_to_uuid('order', item['OrderId']),
            "order_number": f"IMP-{item['OrderId']}",
            "status": status,
            "customer_name": item.get('Username', ''),
            "total_amount": 0,
            "payment_method": payment,
            "notes": item.get('Comment'),
            "created_at": created_date,
            "updated_at": created_date,
        })
    
    try:
        # Insert in batches
        batch_size = 100
        for i in range(0, len(orders), batch_size):
            batch = orders[i:i+batch_size]
            result = supabase.table('orders').upsert(batch).execute()
        print(f"   [OK] Migrated {len(orders)} orders")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def migrate_order_items(supabase: Client) -> bool:
    """Migrate order items"""
    print("\n[5/6] Migrating order items...")
    data = load_json("dbo_OrderProduct.json")
    
    items = []
    for item in data:
        price = float(item.get('Price', 0))
        count = item.get('Count', 0)
        total = price * count
        
        items.append({
            "id": int_to_uuid('order_item', item['OrderProductId']),
            "order_id": int_to_uuid('order', item['OrderId']),
            "product_id": int_to_uuid('product', item['ProductId']),
            "product_name": "Product",
            "quantity": count,
            "unit_price": price,
            "total_price": total,
        })
    
    try:
        # Insert in batches
        batch_size = 100
        for i in range(0, len(items), batch_size):
            batch = items[i:i+batch_size]
            result = supabase.table('order_items').upsert(batch).execute()
        print(f"   [OK] Migrated {len(items)} order items")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def migrate_inventory_transactions(supabase: Client) -> bool:
    """Migrate inventory transactions"""
    print("\n[6/6] Migrating inventory transactions...")
    
    # Load consignment note products
    cn_products = load_json("dbo_ConsignmentNoteProduct.json")
    consignments = load_json("dbo_ConsignmentNote.json")
    writeoffs = load_json("dbo_WriteOff.json")
    
    # Map consignments to suppliers
    cn_to_supplier = {}
    for cn in consignments:
        cn_to_supplier[cn['ConsignmentNoteId']] = cn.get('SupplierId')
    
    transactions = []
    
    # Purchase transactions from consignment notes
    for item in cn_products:
        cn_id = item['ConsignmentNoteId']
        supplier_id = cn_to_supplier.get(cn_id)
        
        transactions.append({
            "id": int_to_uuid('inv_txn', item['ConsignmentNoteProductId']),
            "product_id": int_to_uuid('product', item['ProductId']),
            "supplier_id": int_to_uuid('supplier', supplier_id) if supplier_id else None,
            "transaction_type": "purchase",
            "quantity": item.get('Count', 0),
            "unit_cost": float(item.get('PurchasePrice', 0)),
            "total_cost": float(item.get('PurchasePrice', 0)) * item.get('Count', 0),
            "notes": f"Purchase #{cn_id}",
        })
    
    # Write-off transactions
    for item in writeoffs:
        transactions.append({
            "id": int_to_uuid('writeoff', item['WriteOffId']),
            "product_id": int_to_uuid('product', item['ProductId']),
            "supplier_id": None,
            "transaction_type": "write_off",
            "quantity": -item.get('Count', 0),
            "unit_cost": float(item.get('PurchasePrice', 0)),
            "total_cost": float(item.get('PurchasePrice', 0)) * item.get('Count', 0),
            "notes": f"Write-off #{item['WriteOffId']}",
        })
    
    try:
        # Insert in batches
        batch_size = 100
        for i in range(0, len(transactions), batch_size):
            batch = transactions[i:i+batch_size]
            result = supabase.table('inventory_transactions').upsert(batch).execute()
        print(f"   [OK] Migrated {len(transactions)} transactions")
        return True
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False

def update_order_totals(supabase: Client):
    """Update order totals based on items"""
    print("\n[POST] Updating order totals...")
    
    try:
        # Get all orders
        result = supabase.table('orders').select('id').execute()
        orders = result.data
        
        updated = 0
        for order in orders:
            # Get items for this order
            items_result = supabase.table('order_items').select('*').eq('order_id', order['id']).execute()
            items = items_result.data
            
            if items:
                total = sum(item['total_price'] for item in items)
                count = len(items)
                
                supabase.table('orders').update({
                    'total_amount': total,
                    'items_count': count
                }).eq('id', order['id']).execute()
                updated += 1
        
        print(f"   [OK] Updated {updated} orders")
    except Exception as e:
        print(f"   [ERROR] {e}")

def main():
    print("=" * 70)
    print("MAGGAZ BACKUP MIGRATION TO SUPABASE")
    print("=" * 70)
    
    # Create client
    print(f"\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    
    # Test connection
    try:
        result = supabase.table('categories').select('count').limit(1).execute()
        print("[OK] Connected successfully\n")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return 1
    
    # Create missing tables first
    create_missing_tables(supabase)
    
    # Run migrations
    success = True
    success = migrate_categories(supabase) and success
    success = migrate_suppliers(supabase) and success
    success = migrate_products(supabase) and success
    success = migrate_orders(supabase) and success
    success = migrate_order_items(supabase) and success
    success = migrate_inventory_transactions(supabase) and success
    
    # Post-migration updates
    update_order_totals(supabase)
    
    print("\n" + "=" * 70)
    if success:
        print("MIGRATION COMPLETED SUCCESSFULLY!")
    else:
        print("MIGRATION COMPLETED WITH ERRORS")
    print("=" * 70)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
