# Финальная инструкция по миграции

## Проект Supabase
**Project ID**: `onnncepenxxxfprqaodu`
**URL**: https://app.supabase.com/project/onnncepenxxxfprqaodu

## Шаг 1: Создать таблицы в Supabase

1. Откройте https://app.supabase.com/project/onnncepenxxxfprqaodu/sql
2. Создайте New Query
3. Выполните следующий SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Manufacturers
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    type TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access" ON manufacturers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON products FOR ALL USING (true) WITH CHECK (true);
```

## Шаг 2: Запустить миграцию данных

После создания таблиц, выполните:

```bash
cd .kilocode/mcp
node run-migration-cli.mjs
```

## Шаг 3: Редеплой на Vercel

### Вариант A: Через CLI
```bash
npm i -g vercel
vercel --prod
```

### Вариант B: Через Git
1. Закоммитьте изменения
2. Push в main ветку
3. Vercel автоматически задеплоит

### Вариант C: Через Dashboard
1. Откройте https://vercel.com/dashboard
2. Найдите проект lkscale
3. Нажмите "Redeploy"

## Проверка

После миграции проверьте данные:

```sql
SELECT 'manufacturers' as table_name, COUNT(*) as count FROM manufacturers
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'products', COUNT(*) FROM products;
```

Ожидаемый результат:
- manufacturers: 64
- suppliers: 18
- locations: 9
- products: 1102
