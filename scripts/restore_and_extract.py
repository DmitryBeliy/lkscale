# -*- coding: utf-8 -*-
"""
Скрипт для восстановления SQL Server бэкапа и извлечения данных
"""
import pyodbc
import json
import os
import sys
import time
import subprocess
from pathlib import Path

# Настройка кодировки вывода
sys.stdout.reconfigure(encoding='utf-8')

# Пути
BACKUP_FILE = Path("docs/base/maggaz_backup1.bak")
RESTORE_DB_NAME = "maggaz_backup_temp"
OUTPUT_DIR = Path("docs/base/extracted_data")

# Создаем директорию для выходных данных
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def get_connection_string(db_name=None):
    """Строка подключения к LocalDB"""
    base = r"Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\MSSQLLocalDB;Trusted_Connection=yes;"
    if db_name:
        base += f"Database={db_name};"
    return base

def run_sqlcmd(sql):
    """Выполнение SQL через sqlcmd"""
    try:
        result = subprocess.run(
            ["sqlcmd", "-S", r"(localdb)\MSSQLLocalDB", "-E", "-Q", sql],
            capture_output=True,
            text=True,
            timeout=300
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def restore_backup():
    """Восстановление бэкапа в LocalDB"""
    conn_str = get_connection_string()
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    
    # Получаем путь к файлам данных LocalDB
    cursor.execute("SELECT SERVERPROPERTY('InstanceDefaultDataPath')")
    data_path = cursor.fetchone()[0]
    
    backup_path = str(BACKUP_FILE.resolve())
    
    print(f"Восстановление бэкапа из: {backup_path}")
    print(f"Целевая директория данных: {data_path}")
    
    # Проверяем логические имена файлов в бэкапе
    cursor.execute(f"""
        RESTORE FILELISTONLY 
        FROM DISK = N'{backup_path}'
    """)
    files = cursor.fetchall()
    print("\nФайлы в бэкапе:")
    for f in files:
        print(f"  - Logical: {f.LogicalName}, Physical: {f.PhysicalName}, Type: {f.Type}")
    
    # Закрываем соединение и отключаем базу если она существует
    cursor.close()
    conn.close()
    
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    
    # Отключаем существующую базу если есть (force drop)
    try:
        cursor.execute(f"""
            IF EXISTS (SELECT * FROM sys.databases WHERE name = '{RESTORE_DB_NAME}')
            BEGIN
                ALTER DATABASE [{RESTORE_DB_NAME}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                DROP DATABASE [{RESTORE_DB_NAME}];
            END
        """)
        print(f"\nОчищена существующая база {RESTORE_DB_NAME}")
    except Exception as e:
        print(f"\nNote: {e}")
    
    cursor.close()
    conn.close()
    
    # Восстанавливаем бэкап с полным восстановлением
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    
    # Строим команду восстановления с правильными путями
    mdf_path = os.path.join(data_path, f"{RESTORE_DB_NAME}.mdf")
    ldf_path = os.path.join(data_path, f"{RESTORE_DB_NAME}_log.ldf")
    
    restore_sql = f"""
    RESTORE DATABASE [{RESTORE_DB_NAME}]
    FROM DISK = N'{backup_path}'
    WITH 
        MOVE N'{files[0].LogicalName}' TO N'{mdf_path}',
        MOVE N'{files[1].LogicalName}' TO N'{ldf_path}',
        REPLACE,
        RECOVERY,
        STATS = 10
    """
    
    print(f"\nВыполнение RESTORE...")
    cursor.execute(restore_sql)
    
    # Ждем пока восстановление завершится
    print("Ожидание завершения восстановления...")
    time.sleep(5)
    
    # Проверяем состояние
    cursor.execute("SELECT name, state_desc FROM sys.databases WHERE name = ?", (RESTORE_DB_NAME,))
    result = cursor.fetchone()
    if result:
        print(f"Состояние базы: {result.state_desc}")
    
    cursor.close()
    conn.close()
    
    # Если база все еще в RESTORING, пробуем принудительно завершить
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    
    cursor.execute("SELECT state_desc FROM sys.databases WHERE name = ?", (RESTORE_DB_NAME,))
    state = cursor.fetchone()
    
    if state and state[0] == 'RESTORING':
        print("Принудительное завершение восстановления...")
        try:
            cursor.execute(f"RESTORE DATABASE [{RESTORE_DB_NAME}] WITH RECOVERY")
            print("[OK] Восстановление принудительно завершено")
        except Exception as e:
            print(f"Note during recovery: {e}")
    
    cursor.close()
    conn.close()
    
    # Финальная проверка
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT name, state_desc FROM sys.databases WHERE name = ?", (RESTORE_DB_NAME,))
    final_state = cursor.fetchone()
    if final_state:
        print(f"[OK] База данных {RESTORE_DB_NAME} готова (состояние: {final_state.state_desc})")
    cursor.close()
    conn.close()
    
    return True

def extract_schema():
    """Извлечение структуры таблиц"""
    # Подключаемся к восстановленной базе
    conn_str = get_connection_string(RESTORE_DB_NAME)
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Получаем список таблиц
    cursor.execute("""
        SELECT TABLE_SCHEMA, TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_SCHEMA, TABLE_NAME
    """)
    tables = cursor.fetchall()
    
    schema_info = {}
    
    print(f"\n{'='*60}")
    print(f"Найдено таблиц: {len(tables)}")
    print(f"{'='*60}")
    
    for schema, table in tables:
        full_name = f"{schema}.{table}"
        print(f"\n[TABLE] {full_name}")
        
        # Получаем структуру колонок
        cursor.execute(f"""
            SELECT 
                c.COLUMN_NAME,
                c.DATA_TYPE,
                c.CHARACTER_MAXIMUM_LENGTH,
                c.IS_NULLABLE,
                c.COLUMN_DEFAULT,
                pk.CONSTRAINT_TYPE as PRIMARY_KEY
            FROM INFORMATION_SCHEMA.COLUMNS c
            LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA 
                AND c.TABLE_NAME = kcu.TABLE_NAME 
                AND c.COLUMN_NAME = kcu.COLUMN_NAME
            LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS pk
                ON kcu.CONSTRAINT_NAME = pk.CONSTRAINT_NAME
                AND pk.CONSTRAINT_TYPE = 'PRIMARY KEY'
            WHERE c.TABLE_SCHEMA = ? AND c.TABLE_NAME = ?
            ORDER BY c.ORDINAL_POSITION
        """, (schema, table))
        
        columns = cursor.fetchall()
        
        # Получаем количество записей
        cursor.execute(f"SELECT COUNT(*) FROM [{schema}].[{table}]")
        count = cursor.fetchone()[0]
        
        print(f"   Records: {count}")
        print(f"   Columns:")
        
        cols_info = []
        for col in columns:
            pk_marker = " [PK]" if col.PRIMARY_KEY else ""
            length = f"({col.CHARACTER_MAXIMUM_LENGTH})" if col.CHARACTER_MAXIMUM_LENGTH else ""
            print(f"      - {col.COLUMN_NAME}: {col.DATA_TYPE}{length}{pk_marker}")
            cols_info.append({
                "name": col.COLUMN_NAME,
                "type": col.DATA_TYPE,
                "length": col.CHARACTER_MAXIMUM_LENGTH,
                "nullable": col.IS_NULLABLE == "YES",
                "default": col.COLUMN_DEFAULT,
                "primary_key": col.PRIMARY_KEY is not None
            })
        
        schema_info[full_name] = {
            "schema": schema,
            "table": table,
            "columns": cols_info,
            "row_count": count
        }
    
    # Сохраняем схему в JSON
    schema_file = OUTPUT_DIR / "schema.json"
    with open(schema_file, 'w', encoding='utf-8') as f:
        json.dump(schema_info, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Schema saved to: {schema_file}")
    
    cursor.close()
    conn.close()
    
    return schema_info

def export_table_data(schema, table, limit=10000):
    """Экспорт данных таблицы в JSON"""
    conn_str = get_connection_string(RESTORE_DB_NAME)
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    full_name = f"{schema}.{table}"
    print(f"  Exporting {full_name}...", end=" ")
    
    try:
        cursor.execute(f"SELECT * FROM [{schema}].[{table}]")
        columns = [desc[0] for desc in cursor.description]
        
        rows = cursor.fetchall()
        data = []
        for row in rows[:limit]:
            row_dict = {}
            for i, col in enumerate(columns):
                val = row[i]
                # Конвертируем не-сериализуемые типы
                if val is not None:
                    if isinstance(val, (bytes, bytearray)):
                        row_dict[col] = f"<BINARY:{len(val)} bytes>"
                    else:
                        row_dict[col] = val
                else:
                    row_dict[col] = None
            data.append(row_dict)
        
        # Сохраняем в файл
        filename = f"{schema}_{table}.json"
        filepath = OUTPUT_DIR / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"[OK] {len(data)} records")
        
    except Exception as e:
        print(f"[ERR] {e}")
        data = []
    
    cursor.close()
    conn.close()
    
    return data

def main():
    print("="*60)
    print("RESTORE AND EXTRACT FROM BACKUP")
    print("="*60)
    
    # Шаг 1: Восстановление
    try:
        restore_backup()
    except Exception as e:
        print(f"\n[ERR] Restore error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Шаг 2: Извлечение схемы
    try:
        schema_info = extract_schema()
    except Exception as e:
        print(f"\n[ERR] Schema extraction error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Шаг 3: Экспорт данных
    print(f"\n{'='*60}")
    print("EXPORTING TABLE DATA")
    print(f"{'='*60}")
    
    for full_name, info in schema_info.items():
        if info['row_count'] > 0:
            export_table_data(info['schema'], info['table'])
    
    print(f"\n{'='*60}")
    print("DONE!")
    print(f"{'='*60}")
    print(f"Data saved to: {OUTPUT_DIR.absolute()}")

if __name__ == "__main__":
    main()
