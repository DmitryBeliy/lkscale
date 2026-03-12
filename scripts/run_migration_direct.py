# -*- coding: utf-8 -*-
"""
Выполнение SQL миграции через прямое подключение к PostgreSQL
"""
import os
import sys
import psycopg2
from psycopg2 import sql
from pathlib import Path
from urllib.parse import urlparse

sys.stdout.reconfigure(encoding='utf-8')

# Параметры подключения к Supabase
SUPABASE_HOST = "db.csjvvyjpqpchkpaqoufr.supabase.co"
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres"
SUPABASE_PORT = 5432

# Получаем пароль из переменной окружения или используем service_role key
SUPABASE_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD', os.getenv('SUPABASE_SERVICE_ROLE_KEY', ''))

MIGRATION_FILE = Path("docs/base/migration_sql/migration_complete.sql")


def get_connection():
    """Создание подключения к PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=SUPABASE_HOST,
            database=SUPABASE_DB,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            port=SUPABASE_PORT,
            sslmode='require'
        )
        return conn
    except Exception as e:
        print(f"[ERROR] Cannot connect to database: {e}")
        return None


def execute_migration():
    """Выполнение полной миграции"""
    print("="*60)
    print("MAGGAZ BACKUP MIGRATION EXECUTION")
    print("="*60)
    print()
    
    # Проверяем пароль
    if not SUPABASE_PASSWORD:
        print("[ERROR] SUPABASE_DB_PASSWORD not set!")
        print("Please set environment variable:")
        print("  set SUPABASE_DB_PASSWORD=your_db_password")
        print()
        print("Or provide service_role key from Supabase Dashboard")
        return False
    
    # Читаем SQL файл
    if not MIGRATION_FILE.exists():
        print(f"[ERROR] Migration file not found: {MIGRATION_FILE}")
        return False
    
    print(f"Loading migration file: {MIGRATION_FILE}")
    with open(MIGRATION_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"File size: {len(sql_content)} characters")
    print()
    
    # Подключаемся к базе
    print(f"Connecting to {SUPABASE_HOST}...")
    conn = get_connection()
    if not conn:
        return False
    
    print("[OK] Connected successfully")
    print()
    
    # Выполняем миграцию
    print("Starting migration...")
    print("This may take a few minutes...")
    print()
    
    cursor = conn.cursor()
    
    try:
        # Устанавливаем таймаут для долгих запросов
        cursor.execute("SET statement_timeout = '300s';")
        
        # Выполняем SQL
        cursor.execute(sql_content)
        
        # Коммитим транзакцию
        conn.commit()
        
        print("[OK] Migration executed successfully!")
        print()
        
        # Проверяем результаты
        print("Verifying migration results...")
        
        tables = ['categories', 'suppliers', 'products', 'orders', 'order_items', 'inventory_transactions']
        for table in tables:
            try:
                cursor.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table)))
                count = cursor.fetchone()[0]
                print(f"  {table}: {count} records")
            except Exception as e:
                print(f"  {table}: Error - {e}")
        
        print()
        print("="*60)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*60)
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Migration failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)
"""
Выполнение SQL миграции через прямое подключение к PostgreSQL
"""
import os
import sys
import psycopg2
from psycopg2 import sql
from pathlib import Path
from urllib.parse import urlparse

sys.stdout.reconfigure(encoding='utf-8')

# Параметры подключения к Supabase
SUPABASE_HOST = "db.csjvvyjpqpchkpaqoufr.supabase.co"
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres"
SUPABASE_PORT = 5432

# Получаем пароль из переменной окружения или используем service_role key
SUPABASE_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD', os.getenv('SUPABASE_SERVICE_ROLE_KEY', ''))

MIGRATION_FILE = Path("docs/base/migration_sql/migration_complete.sql")


def get_connection():
    """Создание подключения к PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=SUPABASE_HOST,
            database=SUPABASE_DB,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            port=SUPABASE_PORT,
            sslmode='require'
        )
        return conn
    except Exception as e:
        print(f"[ERROR] Cannot connect to database: {e}")
        return None


def execute_migration():
    """Выполнение полной миграции"""
    print("="*60)
    print("MAGGAZ BACKUP MIGRATION EXECUTION")
    print("="*60)
    print()
    
    # Проверяем пароль
    if not SUPABASE_PASSWORD:
        print("[ERROR] SUPABASE_DB_PASSWORD not set!")
        print("Please set environment variable:")
        print("  set SUPABASE_DB_PASSWORD=your_db_password")
        print()
        print("Or provide service_role key from Supabase Dashboard")
        return False
    
    # Читаем SQL файл
    if not MIGRATION_FILE.exists():
        print(f"[ERROR] Migration file not found: {MIGRATION_FILE}")
        return False
    
    print(f"Loading migration file: {MIGRATION_FILE}")
    with open(MIGRATION_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"File size: {len(sql_content)} characters")
    print()
    
    # Подключаемся к базе
    print(f"Connecting to {SUPABASE_HOST}...")
    conn = get_connection()
    if not conn:
        return False
    
    print("[OK] Connected successfully")
    print()
    
    # Выполняем миграцию
    print("Starting migration...")
    print("This may take a few minutes...")
    print()
    
    cursor = conn.cursor()
    
    try:
        # Устанавливаем таймаут для долгих запросов
        cursor.execute("SET statement_timeout = '300s';")
        
        # Выполняем SQL
        cursor.execute(sql_content)
        
        # Коммитим транзакцию
        conn.commit()
        
        print("[OK] Migration executed successfully!")
        print()
        
        # Проверяем результаты
        print("Verifying migration results...")
        
        tables = ['categories', 'suppliers', 'products', 'orders', 'order_items', 'inventory_transactions']
        for table in tables:
            try:
                cursor.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table)))
                count = cursor.fetchone()[0]
                print(f"  {table}: {count} records")
            except Exception as e:
                print(f"  {table}: Error - {e}")
        
        print()
        print("="*60)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*60)
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Migration failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)

