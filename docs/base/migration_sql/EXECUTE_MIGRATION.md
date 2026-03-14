# Выполнение миграции через Supabase Dashboard

## Быстрый старт

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Войдите в проект `csjvvyjpqpchkpaqoufr`
3. Откройте раздел **SQL Editor**

### Шаг 2: Создайте New Query
1. Нажмите **New Query**
2. Дайте название: `MagGaz Migration`

### Шаг 3: Выполните миграцию

**Вариант А: Полный скрипт (рекомендуется)**

Откройте файл [`migration_complete.sql`](migration_complete.sql) и скопируйте ВЕСЬ контент в SQL Editor:

```bash
# Windows - открыть файл для копирования
notepad docs\base\migration_sql\migration_complete.sql
```

Затем:
1. Выделите все (Ctrl+A)
2. Скопируйте (Ctrl+C)
3. Вставьте в SQL Editor Supabase (Ctrl+V)
4. Нажмите **Run**

**⚠️ Важно:** Выполнение займет 2-5 минут из-за большого объема данных (14,848 записей).

---

## Вариант Б: Пошаговая миграция (если полный скрипт падает по таймауту)

Выполняйте файлы по порядку:

### 1. Категории
```sql
-- Скопируйте содержимое из 01_categories.sql
```

### 2. Поставщики
```sql
-- Скопируйте содержимое из 02_suppliers.sql
```

### 3. Товары
```sql
-- Скопируйте содержимое из 03_products.sql
```

### 4. Заказы
```sql
-- Скопируйте содержимое из 04_orders.sql
```

### 5. Позиции заказов
```sql
-- Скопируйте содержимое из 05_order_items.sql
```

### 6. Транзакции
```sql
-- Скопируйте содержимое из 06_inventory_transactions.sql
```

---

## Проверка результатов

После выполнения миграции проверьте данные:

```sql
-- Проверка количества записей
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions;
```

**Ожидаемые результаты:**
| table_name | count |
|------------|-------|
| categories | 13 |
| suppliers | 82 |
| products | 1,102 |
| orders | 5,173 |
| order_items | 6,259 |
| inventory_transactions | 2,219 |

---

## Дополнительные проверки

```sql
-- Проверка связей: товары с категориями
SELECT c.name as category, COUNT(p.id) as products_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY products_count DESC;

-- Проверка связей: заказы с позициями
SELECT o.order_number, o.status, COUNT(oi.id) as items_count, o.total_amount
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.status, o.total_amount
LIMIT 10;

-- Проверка inventory transactions
SELECT transaction_type, COUNT(*) as count, SUM(quantity) as total_qty
FROM inventory_transactions
GROUP BY transaction_type;
```

---

## Troubleshooting

### Ошибка: "Query timeout"
- **Решение:** Используйте пошаговую миграцию (Вариант Б)

### Ошибка: "Duplicate key value"
- **Решение:** Данные уже существуют. Если нужно перезаписать:
```sql
-- Очистка таблиц (осторожно!)
TRUNCATE TABLE inventory_transactions, order_items, orders, products, suppliers, categories CASCADE;
```

### Ошибка: "Foreign key violation"
- **Решение:** Выполняйте файлы строго по порядку (01 → 06)

---

## Готово! 🎉

После успешной миграции данные будут доступны в приложении Lkscale.

## Быстрый старт

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Войдите в проект `csjvvyjpqpchkpaqoufr`
3. Откройте раздел **SQL Editor**

### Шаг 2: Создайте New Query
1. Нажмите **New Query**
2. Дайте название: `MagGaz Migration`

### Шаг 3: Выполните миграцию

**Вариант А: Полный скрипт (рекомендуется)**

Откройте файл [`migration_complete.sql`](migration_complete.sql) и скопируйте ВЕСЬ контент в SQL Editor:

```bash
# Windows - открыть файл для копирования
notepad docs\base\migration_sql\migration_complete.sql
```

Затем:
1. Выделите все (Ctrl+A)
2. Скопируйте (Ctrl+C)
3. Вставьте в SQL Editor Supabase (Ctrl+V)
4. Нажмите **Run**

**⚠️ Важно:** Выполнение займет 2-5 минут из-за большого объема данных (14,848 записей).

---

## Вариант Б: Пошаговая миграция (если полный скрипт падает по таймауту)

Выполняйте файлы по порядку:

### 1. Категории
```sql
-- Скопируйте содержимое из 01_categories.sql
```

### 2. Поставщики
```sql
-- Скопируйте содержимое из 02_suppliers.sql
```

### 3. Товары
```sql
-- Скопируйте содержимое из 03_products.sql
```

### 4. Заказы
```sql
-- Скопируйте содержимое из 04_orders.sql
```

### 5. Позиции заказов
```sql
-- Скопируйте содержимое из 05_order_items.sql
```

### 6. Транзакции
```sql
-- Скопируйте содержимое из 06_inventory_transactions.sql
```

---

## Проверка результатов

После выполнения миграции проверьте данные:

```sql
-- Проверка количества записей
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions;
```

**Ожидаемые результаты:**
| table_name | count |
|------------|-------|
| categories | 13 |
| suppliers | 82 |
| products | 1,102 |
| orders | 5,173 |
| order_items | 6,259 |
| inventory_transactions | 2,219 |

---

## Дополнительные проверки

```sql
-- Проверка связей: товары с категориями
SELECT c.name as category, COUNT(p.id) as products_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY products_count DESC;

-- Проверка связей: заказы с позициями
SELECT o.order_number, o.status, COUNT(oi.id) as items_count, o.total_amount
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.status, o.total_amount
LIMIT 10;

-- Проверка inventory transactions
SELECT transaction_type, COUNT(*) as count, SUM(quantity) as total_qty
FROM inventory_transactions
GROUP BY transaction_type;
```

---

## Troubleshooting

### Ошибка: "Query timeout"
- **Решение:** Используйте пошаговую миграцию (Вариант Б)

### Ошибка: "Duplicate key value"
- **Решение:** Данные уже существуют. Если нужно перезаписать:
```sql
-- Очистка таблиц (осторожно!)
TRUNCATE TABLE inventory_transactions, order_items, orders, products, suppliers, categories CASCADE;
```

### Ошибка: "Foreign key violation"
- **Решение:** Выполняйте файлы строго по порядку (01 → 06)

---

## Готово! 🎉

После успешной миграции данные будут доступны в приложении Lkscale.

