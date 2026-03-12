# -*- coding: utf-8 -*-
"""
Генератор SQL скриптов миграции из бэкапа MS SQL Server в Supabase
Использует UUID v5 для детерминированной генерации ID
"""
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

sys.stdout.reconfigure(encoding='utf-8')

# Пути
DATA_DIR = Path("docs/base/extracted_data")
OUTPUT_DIR = Path("docs/base/migration_sql")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Namespace для UUID v5 (DNS namespace)
NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

# Сопоставление статусов заказов
ORDER_STATUS_MAP = {
    0: 'pending',
    1: 'completed',
    2: 'cancelled',
    3: 'refunded',
    4: 'processing',
}

# Сопоставление типов оплаты
PAYMENT_TYPE_MAP = {
    0: 'cash',
    1: 'card',
    2: 'transfer',
    3: 'online',
}

# Глобальное хранилище маппингов ID
id_mappings: Dict[str, str] = {}


def int_to_uuid(entity_type: str, old_id: int) -> str:
    """Конвертация int ID в UUID v5 (детерминированная)"""
    key = f"{entity_type}_{old_id}"
    if key not in id_mappings:
        id_mappings[key] = str(uuid.uuid5(NAMESPACE, key))
    return id_mappings[key]


def load_json(filename: str) -> List[Dict]:
    """Загрузка JSON файла"""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        print(f"[WARN] File not found: {filepath}")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def escape_sql(value: Any) -> str:
    """Экранирование SQL значений"""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    # Экранируем строки
    str_val = str(value).replace("'", "''").replace("\\", "\\")
    return f"'{str_val}'"


def generate_insert_sql(table: str, columns: List[str], values: List[List[Any]]) -> str:
    """Генерация INSERT SQL"""
    if not values:
        return ""
    
    cols = ', '.join(f'"{c}"' for c in columns)
    rows = []
    for row in values:
        escaped = [escape_sql(v) for v in row]
        rows.append(f"({', '.join(escaped)})")
    
    return f"INSERT INTO {table} ({cols}) VALUES\n" + ',\n'.join(rows) + ";\n"


def generate_categories_sql() -> str:
    """Генерация SQL для категорий товаров"""
    data = load_json("dbo_ProductCategory.json")
    if not data:
        return "-- No categories to migrate\n"
    
    sql = "-- ============================================\n"
    sql += "-- CATEGORIES MIGRATION\n"
    sql += f"-- Generated: {datetime.now().isoformat()}\n"
    sql += f"-- Records: {len(data)}\n"
    sql += "-- ============================================\n\n"
    
    values = []
    for item in data:
        old_id = item.get('ProductCategoryId')
        new_id = int_to_uuid('category', old_id)
        
        values.append([
            new_id,
            item.get('Name', 'Unknown'),
            None,  # description
            '#3B82F6',  # color
            None,  # icon
            old_id,  # sort_order (используем старый ID)
            True,  # is_active
            'now()',  # created_at
            'now()',  # updated_at
        ])
    
    columns = ['id', 'name', 'description', 'color', 'icon', 'sort_order', 'is_active', 'created_at', 'updated_at']
    sql += generate_insert_sql('categories', columns, values)
    sql += f"\n-- Migrated {len(values)} categories\n"
    
    return sql


def generate_suppliers_sql() -> str:
    """Генерация SQL для поставщиков и производителей"""
    suppliers_data = load_json("dbo_Supplier.json")
    manufacturers_data = load_json("dbo_Manufacturer.json")
    
    if not suppliers_data and not manufacturers_data:
        return "-- No suppliers to migrate\n"
    
    sql = "-- ============================================\n"
    sql += "-- SUPPLIERS & MANUFACTURERS MIGRATION\n"
    sql += f"-- Generated: {datetime.now().isoformat()}\n"
    sql += f"-- Suppliers: {len(suppliers_data)}, Manufacturers: {len(manufacturers_data)}\n"
    sql += "-- ============================================\n\n"
    
    values = []
    
    # Производители (type = 'manufacturer')
    for item in manufacturers_data:
        old_id = item.get('ManufacturerId')
        new_id = int_to_uuid('manufacturer', old_id)
        
        values.append([
            new_id,
            item.get('Name', 'Unknown Manufacturer'),
            'manufacturer',  # type
            None,  # contact_name
            None,  # email
            None,  # phone
            None,  # address
            None,  # website
            None,  # notes
            None,  # payment_terms
            None,  # lead_time_days
            None,  # rating
            True,  # is_active
            'now()',  # created_at
            'now()',  # updated_at
        ])
    
    # Поставщики (type = 'supplier')
    for item in suppliers_data:
        old_id = item.get('SupplierId')
        new_id = int_to_uuid('supplier', old_id)
        
        values.append([
            new_id,
            item.get('Name', 'Unknown Supplier'),
            'supplier',  # type
            None,  # contact_name
            None,  # email
            None,  # phone
            None,  # address
            None,  # website
            None,  # notes
            None,  # payment_terms
            None,  # lead_time_days
            None,  # rating
            True,  # is_active
            'now()',  # created_at
            'now()',  # updated_at
        ])
    
    columns = ['id', 'name', 'type', 'contact_name', 'email', 'phone', 'address', 
               'website', 'notes', 'payment_terms', 'lead_time_days', 'rating', 
               'is_active', 'created_at', 'updated_at']
    sql += generate_insert_sql('suppliers', columns, values)
    sql += f"\n-- Migrated {len(values)} suppliers/manufacturers\n"
    
    return sql


def generate_products_sql() -> str:
    """Генерация SQL для товаров"""
    data = load_json("dbo_Product.json")
    if not data:
        return "-- No products to migrate\n"
    
    sql = "-- ============================================\n"
    sql += "-- PRODUCTS MIGRATION\n"
    sql += f"-- Generated: {datetime.now().isoformat()}\n"
    sql += f"-- Records: {len(data)}\n"
    sql += "-- ============================================\n\n"
    
    values = []
    for item in data:
        old_id = item.get('ProductId')
        new_id = int_to_uuid('product', old_id)
        
        # Определяем категорию
        category_id = None
        old_cat_id = item.get('CategoryId')
        if old_cat_id:
            category_id = int_to_uuid('category', old_cat_id)
        
        # Определяем производителя
        manufacturer_id = None
        old_manuf_id = item.get('ManufacturerId')
        if old_manuf_id:
            manufacturer_id = int_to_uuid('manufacturer', old_manuf_id)
        
        values.append([
            new_id,
            category_id,
            manufacturer_id,
            item.get('Name', 'Unknown Product'),
            item.get('VendorCode'),  # sku
            item.get('ManufacturerBarcodes') if item.get('ManufacturerBarcodes') else None,  # barcode
            item.get('Description'),
            float(item.get('PriceTypeValue', 0)) if item.get('PriceTypeValue') else 0,  # price
            0,  # cost_price
            None,  # compare_at_price
            item.get('MinStock', 0) if item.get('MinStock') else 0,
            0,  # stock
            'шт',  # unit
            False,  # has_variants
            None,  # image_url
            '[]',  # images
            not item.get('IsArchive', False),  # is_active
            False,  # is_featured
            None,  # seo_title
            None,  # seo_description
            None,  # slug
            '[]',  # tags
            '{}',  # attributes
            '{}',  # metadata
            'now()',  # created_at
            'now()',  # updated_at
            None,  # deleted_at
        ])
    
    columns = ['id', 'category_id', 'manufacturer_id', 'name', 'sku', 'barcode', 
               'description', 'price', 'cost_price', 'compare_at_price', 'min_stock',
               'stock', 'unit', 'has_variants', 'image_url', 'images', 'is_active',
               'is_featured', 'seo_title', 'seo_description', 'slug', 'tags',
               'attributes', 'metadata', 'created_at', 'updated_at', 'deleted_at']
    
    # Разбиваем на batches по 500 записей для оптимизации
    batch_size = 500
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        sql += generate_insert_sql('products', columns, batch)
    
    sql += f"\n-- Migrated {len(values)} products\n"
    
    return sql


def generate_orders_sql() -> str:
    """Генерация SQL для заказов"""
    data = load_json("dbo_Order.json")
    if not data:
        return "-- No orders to migrate\n"
    
    sql = "-- ============================================\n"
    sql += "-- ORDERS MIGRATION\n"
    sql += f"-- Generated: {datetime.now().isoformat()}\n"
    sql += f"-- Records: {len(data)}\n"
    sql += "-- ============================================\n\n"
    
    values = []
    for item in data:
        old_id = item.get('OrderId')
        new_id = int_to_uuid('order', old_id)
        
        # Преобразуем статус
        status_num = item.get('Status', 0)
        status = ORDER_STATUS_MAP.get(status_num, 'pending')
        
        # Преобразуем тип оплаты
        payment_num = item.get('PaymentType', 0)
        payment_method = PAYMENT_TYPE_MAP.get(payment_num, 'cash')
        
        # Преобразуем дату
        created_date = item.get('CreatedDateUtc')
        if created_date:
            # Преобразуем в ISO 8601
            created_date = created_date.replace(' ', 'T')
            if '.' not in created_date:
                created_date += '.000'
            created_date += '+00:00'
        else:
            created_date = 'now()'
        
        values.append([
            new_id,
            f"IMP-{old_id}",  # order_number
            status,
            item.get('Username', ''),  # customer_name
            None,  # customer_phone
            None,  # customer_address
            None,  # items (JSON)
            0,  # items_count
            0,  # total_amount
            payment_method,
            item.get('Comment'),  # notes
            created_date,  # created_at
            created_date if isinstance(created_date, str) and created_date != 'now()' else 'now()',  # updated_at
        ])
    
    columns = ['id', 'order_number', 'status', 'customer_name', 'customer_phone', 
               'customer_address', 'items', 'items_count', 'total_amount', 
               'payment_method', 'notes', 'created_at', 'updated_at']
    
    # Разбиваем на batches
    batch_size = 500
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        sql += generate_insert_sql('orders', columns, batch)
    
    sql += f"\n-- Migrated {len(values)} orders\n"
    
    return sql


def generate_order_items_sql() -> str:
    """Генерация SQL для позиций заказов"""
    data = load_json("dbo_OrderProduct.json")
    if not data:
        return "-- No order items to migrate\n"
    
    sql = "-- ============================================\n"
    sql += "-- ORDER ITEMS MIGRATION\n"
    sql += f"-- Generated: {datetime.now().isoformat()}\n"
    sql += f"-- Records: {len(data)}\n"
    sql += "-- ============================================\n\n"
    
    values = []
    for item in data:
        old_order_id = item.get('OrderId')
        old_product_id = item.get('ProductId')
        
        order_id = int_to_uuid('order', old_order_id)
        product_id = int_to_uuid('product', old_product_id)
        
        price = float(item.get('Price', 0))
        count = item.get('Count', 0)
        total = price * count
        
        values.append([
            int_to_uuid('order_item', item.get('OrderProductId')),
            order_id,
            product_id,
            item.get('Name', 'Product'),  # product_name
            None,  # product_sku
            count,  # quantity
            price,  # unit_price
            total,  # total_price
            float(item.get('PurchasePrice', 0)),  # cost_price
            None,  # notes
            'now()',  # created_at
        ])
    
    columns = ['id', 'order_id', 'product_id', 'product_name', 'product_sku', 
               'quantity', 'unit_price', 'total_price', 'cost_price', 'notes', 'created_at']
    
    # Разбиваем на batches
    batch_size = 500
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        sql += generate_insert_sql('order_items', columns, batch)
    
    sql += f"\n-- Migrated {len(values)} order items\n"
    
    return sql


def generate_inventory_transactions_sql() -> str:
    """Генерация SQL для накладных и списаний"""
    consignment_data = load_json("dbo_ConsignmentNote.json")
    writeoff_data = load_json("dbo_WriteOff.json")
    
    if not consignment_data and not writeoff_data:
        return "-- No inventory transactions to migrate\n"
    
    sql = "-- ============================================\n"
    sql += "-- INVENTORY TRANSACTIONS MIGRATION\n"
    sql += f"-- Generated: {datetime.now().isoformat()}\n"
    sql += f"-- Consignment Notes: {len(consignment_data)}, Write-offs: {len(writeoff_data)}\n"
    sql += "-- ============================================\n\n"
    
    # Загружаем данные о товарах накладных
    cn_products = load_json("dbo_ConsignmentNoteProduct.json")
    cn_products_map: Dict[int, List[Dict]] = {}
    for cp in cn_products:
        cn_id = cp.get('ConsignmentNoteId')
        if cn_id not in cn_products_map:
            cn_products_map[cn_id] = []
        cn_products_map[cn_id].append(cp)
    
    values = []
    
    # Накладные (приходы) - каждый товар отдельной строкой
    for item in consignment_data:
        old_cn_id = item.get('ConsignmentNoteId')
        supplier_id = item.get('SupplierId')
        
        # Получаем товары для этой накладной
        products = cn_products_map.get(old_cn_id, [])
        
        created_date = item.get('CreatedDateUtc')
        if created_date:
            created_date = created_date.replace(' ', 'T')
            if '.' not in created_date:
                created_date += '.000'
            created_date += '+00:00'
        else:
            created_date = 'now()'
        
        for cp in products:
            values.append([
                int_to_uuid('inv_txn', cp.get('ConsignmentNoteProductId')),
                int_to_uuid('product', cp.get('ProductId')),
                int_to_uuid('supplier', supplier_id) if supplier_id else None,
                'purchase',  # transaction_type
                cp.get('Count', 0),  # quantity
                float(cp.get('PurchasePrice', 0)),  # unit_cost
                float(cp.get('PurchasePrice', 0)) * cp.get('Count', 0),  # total_cost
                'completed',  # status
                f"Приходная накладная #{old_cn_id}",  # notes
                created_date,  # created_at
            ])
    
    # Списания
    for item in writeoff_data:
        old_id = item.get('WriteOffId')
        
        created_date = item.get('CreatedDateUtc')
        if created_date:
            created_date = created_date.replace(' ', 'T')
            if '.' not in created_date:
                created_date += '.000'
            created_date += '+00:00'
        else:
            created_date = 'now()'
        
        values.append([
            int_to_uuid('writeoff', old_id),
            int_to_uuid('product', item.get('ProductId')),
            None,  # supplier_id
            'write_off',  # transaction_type
            -item.get('Count', 0),  # quantity (отрицательная для списания)
            float(item.get('PurchasePrice', 0)),  # unit_cost
            float(item.get('PurchasePrice', 0)) * item.get('Count', 0),  # total_cost
            'completed',  # status
            f"Списание #{old_id}",  # notes
            created_date,  # created_at
        ])
    
    columns = ['id', 'product_id', 'supplier_id', 'transaction_type', 'quantity', 
               'unit_cost', 'total_cost', 'status', 'notes', 'created_at']
    
    # Разбиваем на batches
    batch_size = 500
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        sql += generate_insert_sql('inventory_transactions', columns, batch)
    
    sql += f"\n-- Migrated {len(values)} inventory transactions\n"
    
    return sql


def main():
    print("="*60)
    print("MAGGAZ BACKUP SQL MIGRATION GENERATOR")
    print("="*60)
    print()
    
    # 1. Categories
    print("Generating 01_categories.sql...")
    categories_sql = generate_categories_sql()
    with open(OUTPUT_DIR / "01_categories.sql", 'w', encoding='utf-8') as f:
        f.write(categories_sql)
    
    # 2. Suppliers
    print("Generating 02_suppliers.sql...")
    suppliers_sql = generate_suppliers_sql()
    with open(OUTPUT_DIR / "02_suppliers.sql", 'w', encoding='utf-8') as f:
        f.write(suppliers_sql)
    
    # 3. Products
    print("Generating 03_products.sql...")
    products_sql = generate_products_sql()
    with open(OUTPUT_DIR / "03_products.sql", 'w', encoding='utf-8') as f:
        f.write(products_sql)
    
    # 4. Orders
    print("Generating 04_orders.sql...")
    orders_sql = generate_orders_sql()
    with open(OUTPUT_DIR / "04_orders.sql", 'w', encoding='utf-8') as f:
        f.write(orders_sql)
    
    # 5. Order Items
    print("Generating 05_order_items.sql...")
    order_items_sql = generate_order_items_sql()
    with open(OUTPUT_DIR / "05_order_items.sql", 'w', encoding='utf-8') as f:
        f.write(order_items_sql)
    
    # 6. Inventory Transactions
    print("Generating 06_inventory_transactions.sql...")
    inv_txn_sql = generate_inventory_transactions_sql()
    with open(OUTPUT_DIR / "06_inventory_transactions.sql", 'w', encoding='utf-8') as f:
        f.write(inv_txn_sql)
    
    # 7. Complete migration file
    print("Generating migration_complete.sql...")
    complete_sql = "-- ============================================\n"
    complete_sql += "-- MAGGAZ BACKUP COMPLETE MIGRATION\n"
    complete_sql += f"-- Generated: {datetime.now().isoformat()}\n"
    complete_sql += "-- ============================================\n\n"
    complete_sql += "BEGIN;\n\n"
    complete_sql += "-- Step 1: Categories\n"
    complete_sql += categories_sql.replace("-- ============================================\n", "")
    complete_sql += "\n-- Step 2: Suppliers & Manufacturers\n"
    complete_sql += suppliers_sql.replace("-- ============================================\n", "")
    complete_sql += "\n-- Step 3: Products\n"
    complete_sql += products_sql.replace("-- ============================================\n", "")
    complete_sql += "\n-- Step 4: Orders\n"
    complete_sql += orders_sql.replace("-- ============================================\n", "")
    complete_sql += "\n-- Step 5: Order Items\n"
    complete_sql += order_items_sql.replace("-- ============================================\n", "")
    complete_sql += "\n-- Step 6: Inventory Transactions\n"
    complete_sql += inv_txn_sql.replace("-- ============================================\n", "")
    complete_sql += "\nCOMMIT;\n\n"
    
    # Добавляем SQL для обновления итогов заказов
    complete_sql += "-- ============================================\n"
    complete_sql += "-- POST-MIGRATION UPDATES\n"
    complete_sql += "-- ============================================\n\n"
    complete_sql += "-- Update order totals based on order_items\n"
    complete_sql += """UPDATE orders o
SET 
    total_amount = COALESCE(sub.total, 0),
    items_count = COALESCE(sub.count, 0),
    items = COALESCE(sub.items_json, '[]'::jsonb)
FROM (
    SELECT 
        order_id, 
        SUM(total_price) as total,
        COUNT(*) as count,
        jsonb_agg(jsonb_build_object(
            'product_id', product_id,
            'product_name', product_name,
            'quantity', quantity,
            'unit_price', unit_price,
            'total_price', total_price
        )) as items_json
    FROM order_items 
    GROUP BY order_id
) sub
WHERE o.id = sub.order_id;
"""
    
    # Update product stock based on inventory_transactions
    complete_sql += """
-- Update product stock based on inventory_transactions
UPDATE products p
SET stock = COALESCE(sub.total_qty, 0)
FROM (
    SELECT product_id, SUM(quantity) as total_qty
    FROM inventory_transactions
    GROUP BY product_id
) sub
WHERE p.id = sub.product_id;
"""
    
    with open(OUTPUT_DIR / "migration_complete.sql", 'w', encoding='utf-8') as f:
        f.write(complete_sql)
    
    # Статистика
    categories_data = load_json("dbo_ProductCategory.json")
    suppliers_data = load_json("dbo_Supplier.json")
    manufacturers_data = load_json("dbo_Manufacturer.json")
    products_data = load_json("dbo_Product.json")
    orders_data = load_json("dbo_Order.json")
    order_items_data = load_json("dbo_OrderProduct.json")
    consignment_data = load_json("dbo_ConsignmentNote.json")
    writeoff_data = load_json("dbo_WriteOff.json")
    cn_products = load_json("dbo_ConsignmentNoteProduct.json")
    
    print()
    print("="*60)
    print("MIGRATION SQL FILES GENERATED SUCCESSFULLY")
    print("="*60)
    print()
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    print("Generated files:")
    print(f"  1. 01_categories.sql           - {len(categories_data)} categories")
    print(f"  2. 02_suppliers.sql            - {len(suppliers_data)} suppliers + {len(manufacturers_data)} manufacturers = {len(suppliers_data) + len(manufacturers_data)} total")
    print(f"  3. 03_products.sql             - {len(products_data)} products")
    print(f"  4. 04_orders.sql               - {len(orders_data)} orders")
    print(f"  5. 05_order_items.sql          - {len(order_items_data)} order items")
    print(f"  6. 06_inventory_transactions.sql - {len(cn_products) + len(writeoff_data)} transactions ({len(cn_products)} purchases + {len(writeoff_data)} write-offs)")
    print(f"  7. migration_complete.sql      - Complete migration script")
    print()
    total_inserts = (len(categories_data) + len(suppliers_data) + len(manufacturers_data) + 
                     len(products_data) + len(orders_data) + len(order_items_data) + 
                     len(cn_products) + len(writeoff_data))
    print(f"Total INSERT statements: {total_inserts}")
    print()


if __name__ == "__main__":
    main()
