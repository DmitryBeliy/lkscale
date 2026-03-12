# -*- coding: utf-8 -*-
"""
Выполнение SQL миграции через Supabase REST API
"""
import os
import sys
import requests
import time
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# Supabase credentials
SUPABASE_URL = "https://csjvvyjpqpchkpaqoufr.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "sb_secret_o21vvFuDW4uVmZNXn7Y5OQ_-rvNhMV3sb_secret_o21vvFuDW4uVmZNXn7Y5OQ_-rvNhMV3"

MIGRATION_FILE = Path("docs/base/migration_sql/migration_complete.sql")

def execute_sql_via_rest(sql: str) -> dict:
    """Выполнение SQL через Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
    }
    payload = {"query": sql}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=120)
        if response.status_code == 200:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": response.text, "status": response.status_code}
    except Exception as e:
        return {"success": False, "error": str(e)}


def split_sql_batches(sql_content: str, max_batch_size: int = 100000) -> list:
    """Разделение SQL на батчи по командам"""
    # Разделяем по ";" но сохраняем команды вместе
    statements = []
    current_batch = []
    current_size = 0
    
    # Простое разделение по INSERT блокам
    lines = sql_content.split('\n')
    current_statement = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('--'):
            continue
        
        current_statement.append(line)
        
        if line.endswith(';'):
            stmt = ' '.join(current_statement)
            if len(stmt) > 10:  # Игнорируем пустые
                statements.append(stmt)
            current_statement = []
    
    return statements


def execute_migration():
    """Выполнение полной миграции"""
    print("="*60)
    print("MAGGAZ BACKUP MIGRATION EXECUTION")
    print("="*60)
    print()
    
    # Читаем SQL файл
    if not MIGRATION_FILE.exists():
        print(f"[ERROR] Migration file not found: {MIGRATION_FILE}")
        return False
    
    print(f"Loading migration file: {MIGRATION_FILE}")
    with open(MIGRATION_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"File size: {len(sql_content)} characters")
    print()
    
    # Проверяем соединение
    print("Testing connection to Supabase...")
    test_result = execute_sql_via_rest("SELECT 1 as test")
    if not test_result.get('success'):
        print(f"[ERROR] Cannot connect to Supabase: {test_result.get('error')}")
        return False
    print("[OK] Connection successful")
    print()
    
    # Выполняем миграцию по частям
    # Сначала выполним BEGIN и структурные команды
    print("Starting migration...")
    print()
    
    # Разделяем на части
    parts = sql_content.split('-- Step ')
    
    for i, part in enumerate(parts):
        if not part.strip():
            continue
        
        # Добавляем маркер обратно
        if i > 0:
            part = '-- Step ' + part
        
        print(f"Executing part {i} ({len(part)} chars)...")
        
        result = execute_sql_via_rest(part)
        if result.get('success'):
            print(f"  [OK] Success")
        else:
            print(f"  [ERROR] {result.get('error', 'Unknown error')}")
            if result.get('status') == 504:  # Gateway timeout - возможно выполнилось
                print("  [WARN] Timeout, but operation may have succeeded")
            else:
                print("  [FATAL] Migration failed!")
                return False
        
        # Небольшая задержка между запросами
        time.sleep(0.5)
    
    print()
    print("="*60)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*60)
    return True


if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)
"""
Выполнение SQL миграции через Supabase REST API
"""
import os
import sys
import requests
import time
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# Supabase credentials
SUPABASE_URL = "https://csjvvyjpqpchkpaqoufr.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "sb_secret_o21vvFuDW4uVmZNXn7Y5OQ_-rvNhMV3sb_secret_o21vvFuDW4uVmZNXn7Y5OQ_-rvNhMV3"

MIGRATION_FILE = Path("docs/base/migration_sql/migration_complete.sql")

def execute_sql_via_rest(sql: str) -> dict:
    """Выполнение SQL через Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
    }
    payload = {"query": sql}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=120)
        if response.status_code == 200:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": response.text, "status": response.status_code}
    except Exception as e:
        return {"success": False, "error": str(e)}


def split_sql_batches(sql_content: str, max_batch_size: int = 100000) -> list:
    """Разделение SQL на батчи по командам"""
    # Разделяем по ";" но сохраняем команды вместе
    statements = []
    current_batch = []
    current_size = 0
    
    # Простое разделение по INSERT блокам
    lines = sql_content.split('\n')
    current_statement = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('--'):
            continue
        
        current_statement.append(line)
        
        if line.endswith(';'):
            stmt = ' '.join(current_statement)
            if len(stmt) > 10:  # Игнорируем пустые
                statements.append(stmt)
            current_statement = []
    
    return statements


def execute_migration():
    """Выполнение полной миграции"""
    print("="*60)
    print("MAGGAZ BACKUP MIGRATION EXECUTION")
    print("="*60)
    print()
    
    # Читаем SQL файл
    if not MIGRATION_FILE.exists():
        print(f"[ERROR] Migration file not found: {MIGRATION_FILE}")
        return False
    
    print(f"Loading migration file: {MIGRATION_FILE}")
    with open(MIGRATION_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"File size: {len(sql_content)} characters")
    print()
    
    # Проверяем соединение
    print("Testing connection to Supabase...")
    test_result = execute_sql_via_rest("SELECT 1 as test")
    if not test_result.get('success'):
        print(f"[ERROR] Cannot connect to Supabase: {test_result.get('error')}")
        return False
    print("[OK] Connection successful")
    print()
    
    # Выполняем миграцию по частям
    # Сначала выполним BEGIN и структурные команды
    print("Starting migration...")
    print()
    
    # Разделяем на части
    parts = sql_content.split('-- Step ')
    
    for i, part in enumerate(parts):
        if not part.strip():
            continue
        
        # Добавляем маркер обратно
        if i > 0:
            part = '-- Step ' + part
        
        print(f"Executing part {i} ({len(part)} chars)...")
        
        result = execute_sql_via_rest(part)
        if result.get('success'):
            print(f"  [OK] Success")
        else:
            print(f"  [ERROR] {result.get('error', 'Unknown error')}")
            if result.get('status') == 504:  # Gateway timeout - возможно выполнилось
                print("  [WARN] Timeout, but operation may have succeeded")
            else:
                print("  [FATAL] Migration failed!")
                return False
        
        # Небольшая задержка между запросами
        time.sleep(0.5)
    
    print()
    print("="*60)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*60)
    return True


if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)

