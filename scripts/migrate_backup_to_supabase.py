# -*- coding: utf-8 -*-
"""
Скрипт миграции данных из бэкапа MS SQL Server в Supabase

Сопоставление таблиц:
- Product -> products
- ProductCategory -> categories  
- Manufacturer -> manufacturers (новая таблица)
- Supplier -> suppliers
- Location -> warehouses
- ConsignmentNote -> inventory_transactions (type='purchase')
- Order -> orders
- OrderProduct -> order_items
- WriteOff -> inventory_transactions (type='write_off')
"""
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = Path("docs/base/extracted_data")
OUTPUT_DIR = Path("docs/base/migration_sql")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Сопоставление типов заказов
ORDER_STATUS_MAP = {
    0: 'pending',      # Created
    1: 'processing',   # In progress
    2: 'completed',    # Completed
    3: 'cancelled',    # Cancelled
    4: 'refunded',     # Refunded
}

# Сопоставление типов оплаты
PAYMENT_TYPE_MAP = {
    0: 'cash',
    1: 'card', 
    2: 'online',
    3: 'transfer',
}

def generate_uuid() -> str:
    """Генерация UUID v4"""
    return str(uuid.uuid4())

def int_to_uuid(seed: int) -> str:
    """Конвертация int ID в UUID (детерминированная)"""
    # Используем UUID v5 на основе seed для консистентности
    namespace = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')  # DNS namespace
    return str(uuid.uuid5(namespace, f"maggaz_{seed}"))

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
    if isinstance(value, datetime):
        return f"'{value.isoformat()}'"
    # Экранируем строки
    str_val = str(value).replace("'", "''").replace("\\", "\\\\")
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

class MigrationGenerator:
    def __init__(self, company_id: str, user_id: str):
        self.company_id = company_id
        self.user_id = user_id
        self.id_mappings = {}  # Для хранения соответствия старых ID -> новые UUID
        
    def migrate_categories(self) -> str:
        """Миграция категорий товаров"""
        data = load_json("dbo_ProductCategory.json")
        if not data:
            return "-- No categories to migrate\n"
        
        sql = "-- CATEGORIES MIGRATION\n"
        sql += "DELETE FROM categories WHERE company_id = {} AND name LIKE '[Imported] %';\n".format(
            escape_sql(self.company_id)
        )
        
        values = []
        for item in data:
            old_id = item.get('ProductCategoryId')
            new_id = generate_uuid()
            self.id_mappings[f"category_{old_id}"] = new_id
            
            values.append([
                new_id,
                self.company_id,
                None,  # parent_id
                "[Imported] " + item.get('Name', 'Unknown'),
                None,  # description
                '#3B82F6',  # color
                None,  # icon
                0,  # sort_order
                True,  # is_active
                datetime.now(),  # created_at
                datetime.now(),  # updated_at
            ])
        
        columns = ['id', 'company_id', 'parent_id', 'name', 'description', 'color', 'icon', 
                   'sort_order', 'is_active', 'created_at', 'updated_at']
        
        sql += generate_insert_sql('categories', columns, values)
        sql += f"\n-- Migrated {len(values)} categories\n\n"
        return sql
    
    def migrate_manufacturers(self) -> str:
        """Миграция производителей как поставщиков с типом manufacturer"""
        data = load_json("dbo_Manufacturer.json")
        if not data:
            return "-- No manufacturers to migrate\n"
        
        sql = "-- MANUFACTURERS MIGRATION (as suppliers)\n"
        
        values = []
        for item in data:
            old_id = item.get('ManufacturerId')
            new_id = generate_uuid()
            self.id_mappings[f"manufacturer_{old_id}"] = new_id
            
            values.append([
                new_id,
                self.company_id,
                item.get('Name', 'Unknown Manufacturer'),
                'manufacturer',  # type
                None,  # contact_person
                None,  # email
                None,  # phone
                None,  # address
                None,  # inn
                True,  # is_active
                datetime.now(),
                datetime.now(),
            ])
        
        columns = ['id', 'company_id', 'name', 'type', 'contact_person', 'email', 
                   'phone', 'address', 'inn', 'is_active', 'created_at', 'updated_at']
        
        sql += generate_insert_sql('suppliers', columns, values)
        sql += f"\n-- Migrated {len(values)} manufacturers\n\n"
        return sql
    
    def migrate_suppliers(self) -> str:
        """Миграция поставщиков"""
        data = load_json("dbo_Supplier.json")
        if not data:
            return "-- No suppliers to migrate\n"
        
        sql = "-- SUPPLIERS MIGRATION\n"
        
        values = []
        for item in data:
            old_id = item.get('SupplierId')
            new_id = generate_uuid()
            self.id_mappings[f"supplier_{old_id}"] = new_id
            
            values.append([
                new_id,
                self.company_id,
                item.get('Name', 'Unknown Supplier'),
                'supplier',  # type
                None,  # contact_person
                None,  # email
                None,  # phone
                None,  # address
                None,  # inn
                True,  # is_active
                datetime.now(),
                datetime.now(),
            ])
        
        columns = ['id', 'company_id', 'name', 'type', 'contact_person', 'email', 
                   'phone', 'address', 'inn', 'is_active', 'created_at', 'updated_at']
        
        sql += generate_insert_sql('suppliers', columns, values)
        sql += f"\n-- Migrated {len(values)} suppliers\n\n"
        return sql
    
    def migrate_products(self) -> str:
        """Миграция товаров"""
        data = load_json("dbo_Product.json")
        if not data:
            return "-- No products to migrate\n"
        
        sql = "-- PRODUCTS MIGRATION\n"
        
        values = []
        for item in data:
            old_id = item.get('ProductId')
            new_id = generate_uuid()
            self.id_mappings[f"product_{old_id}"] = new_id
            
            # Определяем категорию
            category_id = None
            old_cat_id = item.get('CategoryId')
            if old_cat_id:
                category_id = self.id_mappings.get(f"category_{old_cat_id}")
            
            values.append([
                new_id,
                self.company_id,
                category_id,
                item.get('Name', 'Unknown Product'),
                item.get('VendorCode'),  # sku
                item.get('ManufacturerBarcodes'),  # barcode
                item.get('Description'),
                item.get('PriceTypeValue', 0),  # price
                0,  # cost_price (будет заполнено из ConsignmentNoteProduct)
                None,  # compare_at_price
                item.get('MinStock', 0),
                0,  # stock (будет рассчитано)
                'шт',  # unit
                False,  # has_variants
                None,  # image_url
                '[]',  # images JSON
                not item.get('IsArchive', False),  # is_active
                False,  # is_featured
                None,  # seo_title
                None,  # seo_description
                None,  # slug
                '[]',  # tags
                '{}',  # attributes
                '{}',  # metadata
                datetime.now(),
                datetime.now(),
                None,  # deleted_at
            ])
        
        columns = ['id', 'company_id', 'category_id', 'name', 'sku', 'barcode', 
                   'description', 'price', 'cost_price', 'compare_at_price', 'min_stock',
                   'stock', 'unit', 'has_variants', 'image_url', 'images', 'is_active',
                   'is_featured', 'seo_title', 'seo_description', 'slug', 'tags',
                   'attributes', 'metadata', 'created_at', 'updated_at', 'deleted_at']
        
        # Разбиваем на batches по 100 записей
        batch_size = 100
        for i in range(0, len(values), batch_size):
            batch = values[i:i+batch_size]
            sql += generate_insert_sql('products', columns, batch)
        
        sql += f"\n-- Migrated {len(values)} products\n\n"
        return sql
    
    def migrate_warehouses(self) -> str:
        """Миграция локаций как складов"""
        data = load_json("dbo_Location.json")
        if not data:
            return "-- No locations to migrate\n"
        
        sql = "-- WAREHOUSES (Locations) MIGRATION\n"
        
        values = []
        for item in data:
            old_id = item.get('LocationId')
            new_id = generate_uuid()
            self.id_mappings[f"location_{old_id}"] = new_id
            
            location_type = 'warehouse' if item.get('Type') == 0 else 'store'
            
            values.append([
                new_id,
                self.company_id,
                item.get('Name', 'Unknown Location'),
                location_type,
                True,  # is_active
                None,  # address
                None,  # manager_id
                datetime.now(),
                datetime.now(),
            ])
        
        columns = ['id', 'company_id', 'name', 'type', 'is_active', 'address', 'manager_id', 'created_at', 'updated_at']
        
        sql += generate_insert_sql('warehouses', columns, values)
        sql += f"\n-- Migrated {len(values)} locations as warehouses\n\n"
        return sql
    
    def migrate_orders(self) -> str:
        """Миграция заказов"""
        data = load_json("dbo_Order.json")
        if not data:
            return "-- No orders to migrate\n"
        
        sql = "-- ORDERS MIGRATION\n"
        
        values = []
        for item in data:
            old_id = item.get('OrderId')
            new_id = generate_uuid()
            self.id_mappings[f"order_{old_id}"] = new_id
            
            # Преобразуем статус
            status_num = item.get('Status', 0)
            status = ORDER_STATUS_MAP.get(status_num, 'pending')
            
            # Преобразуем тип оплаты
            payment_num = item.get('PaymentType', 0)
            payment_method = PAYMENT_TYPE_MAP.get(payment_num, 'cash')
            
            created_date = item.get('CreatedDateUtc')
            if created_date:
                created_date = created_date.replace('T', ' ').replace('Z', '')
            
            values.append([
                new_id,
                self.company_id,
                None,  # customer_id (нет прямого сопоставления)
                f"IMP-{item.get('OrderId')}",  # order_number
                status,
                item.get('Username', ''),  # customer_name
                None,  # customer_phone
                None,  # customer_email
                None,  # shipping_address
                0,  # subtotal (рассчитается из items)
                0,  # tax_amount
                0,  # discount_amount
                0,  # total_amount (рассчитается)
                payment_method,
                'pending',  # payment_status
                None,  # notes -> comment
                item.get('LoyaltyCardNumber'),  # loyalty_card
                self.user_id,  # created_by
                created_date or datetime.now(),
                created_date or datetime.now(),
            ])
        
        columns = ['id', 'company_id', 'customer_id', 'order_number', 'status',
                   'customer_name', 'customer_phone', 'customer_email', 'shipping_address',
                   'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
                   'payment_method', 'payment_status', 'notes', 'loyalty_card',
                   'created_by', 'created_at', 'updated_at']
        
        # Разбиваем на batches
        batch_size = 100
        for i in range(0, len(values), batch_size):
            batch = values[i:i+batch_size]
            sql += generate_insert_sql('orders', columns, batch)
        
        sql += f"\n-- Migrated {len(values)} orders\n\n"
        return sql
    
    def migrate_order_items(self) -> str:
        """Миграция товаров в заказах"""
        data = load_json("dbo_OrderProduct.json")
        if not data:
            return "-- No order items to migrate\n"
        
        sql = "-- ORDER ITEMS MIGRATION\n"
        
        values = []
        for item in data:
            old_order_id = item.get('OrderId')
            old_product_id = item.get('ProductId')
            
            order_id = self.id_mappings.get(f"order_{old_order_id}")
            product_id = self.id_mappings.get(f"product_{old_product_id}")
            
            if not order_id or not product_id:
                continue  # Пропускаем если не найдено сопоставление
            
            new_id = generate_uuid()
            price = item.get('Price', 0)
            count = item.get('Count', 0)
            total = price * count
            
            values.append([
                new_id,
                order_id,
                product_id,
                None,  # variant_id
                count,
                price,
                total,  # total_price
                0,  # discount_amount
                item.get('PurchasePrice', 0),  # cost_price
                None,  # notes
            ])
        
        columns = ['id', 'order_id', 'product_id', 'variant_id', 'quantity', 
                   'unit_price', 'total_price', 'discount_amount', 'cost_price', 'notes']
        
        # Разбиваем на batches
        batch_size = 100
        for i in range(0, len(values), batch_size):
            batch = values[i:i+batch_size]
            sql += generate_insert_sql('order_items', columns, batch)
        
        sql += f"\n-- Migrated {len(values)} order items\n\n"
        return sql
    
    def generate_migration_sql(self) -> str:
        """Генерация полного SQL миграции"""
        print("Generating migration SQL...")
        
        sql = "-- ============================================\n"
        sql += "-- MAGGAZ BACKUP MIGRATION TO SUPABASE\n"
        sql += f"-- Generated: {datetime.now().isoformat()}\n"
        sql += f"-- Company ID: {self.company_id}\n"
        sql += f"-- User ID: {self.user_id}\n"
        sql += "-- ============================================\n\n"
        
        sql += "BEGIN;\n\n"
        
        # Порядок миграции важен из-за foreign keys
        print("  - Categories...")
        sql += self.migrate_categories()
        
        print("  - Manufacturers...")
        sql += self.migrate_manufacturers()
        
        print("  - Suppliers...")
        sql += self.migrate_suppliers()
        
        print("  - Products...")
        sql += self.migrate_products()
        
        print("  - Warehouses...")
        sql += self.migrate_warehouses()
        
        print("  - Orders...")
        sql += self.migrate_orders()
        
        print("  - Order Items...")
        sql += self.migrate_order_items()
        
        sql += "COMMIT;\n\n"
        
        # Добавляем SQL для обновления итогов заказов
        sql += "-- UPDATE ORDERS TOTALS\n"
        sql += """
UPDATE orders o
SET 
    subtotal = sub.total,
    total_amount = sub.total
FROM (
    SELECT order_id, SUM(total_price) as total 
    FROM order_items 
    GROUP BY order_id
) sub
WHERE o.id = sub.order_id AND o.company_id = {};
""".format(escape_sql(self.company_id))
        
        return sql

def main():
    print("="*60)
    print("MAGGAZ BACKUP MIGRATION GENERATOR")
    print("="*60)
    
    # Параметры миграции
    company_id = os.getenv('MIGRATION_COMPANY_ID', generate_uuid())
    user_id = os.getenv('MIGRATION_USER_ID', generate_uuid())
    
    print(f"\nTarget Company ID: {company_id}")
    print(f"Target User ID: {user_id}")
    print()
    
    # Генерируем миграцию
    generator = MigrationGenerator(company_id, user_id)
    sql = generator.generate_migration_sql()
    
    # Сохраняем SQL файл
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sql_file = OUTPUT_DIR / f"migration_{timestamp}.sql"
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    # Сохраняем маппинг ID
    mapping_file = OUTPUT_DIR / f"id_mapping_{timestamp}.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(generator.id_mappings, f, indent=2)
    
    print(f"\n{'='*60}")
    print("MIGRATION FILES GENERATED")
    print(f"{'='*60}")
    print(f"SQL File: {sql_file}")
    print(f"ID Mapping: {mapping_file}")
    print()
    print("To apply migration:")
    print(f"  1. Review the SQL file: {sql_file}")
    print(f"  2. Execute via Supabase Dashboard or psql")
    print(f"  3. Set COMPANY_ID and USER_ID env vars before running")
    print()
    print("Example:")
    print(f"  export MIGRATION_COMPANY_ID='your-company-uuid'")
    print(f"  export MIGRATION_USER_ID='your-user-uuid'")
    print(f"  psql $DATABASE_URL -f {sql_file}")

if __name__ == "__main__":
    main()
