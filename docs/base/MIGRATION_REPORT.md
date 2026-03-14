# Отчет о миграции данных из бэкапа Maggaz

## 📋 Общая информация

| Параметр | Значение |
|----------|----------|
| Исходный файл | `docs/base/maggaz_backup1.bak` |
| Тип файла | Microsoft SQL Server Backup |
| Размер файла | 52.6 MB |
| Дата анализа | 2026-03-08 |

---

## 🔍 Структура исходной базы данных

### Таблицы (15 шт.)

| Таблица | Записей | Описание | Маппинг в Supabase |
|---------|---------|----------|-------------------|
| `Product` | 1,102 | Товары | → `products` |
| `ProductCategory` | 13 | Категории товаров | → `categories` |
| `ProductType` | 23 | Типы товаров | → (deprecated) |
| `Manufacturer` | 64 | Производители | → `suppliers` (type='manufacturer') |
| `Supplier` | 18 | Поставщики | → `suppliers` (type='supplier') |
| `Location` | 9 | Склады/локации | → `warehouses` |
| `Outlet` | 3 | Торговые точки | → `warehouses` (type='store') |
| `ConsignmentNote` | 976 | Приходные накладные | → `inventory_transactions` (type='purchase') |
| `ConsignmentNoteProduct` | 1,973 | Товары в накладных | → `inventory_transaction_items` |
| `Order` | 5,173 | Заказы | → `orders` |
| `OrderProduct` | 6,259 | Товары в заказах | → `order_items` |
| `WriteOff` | 246 | Списания | → `inventory_transactions` (type='write_off') |
| `ProductLocation` | 1,080 | Остатки товаров | → `product_stock` |
| `UserActivityLog` | 10,192 | Лог активности | → (не мигрируется) |
| `__EFMigrationsHistory` | 25 | История миграций EF | → (не мигрируется) |

**Итого записей для миграции:** ~28,000

---

## 📊 Детальная структура ключевых таблиц

### Товары (Product)

```sql
ProductId: int [PK]
VendorCode: nvarchar(100)       -- → sku
Name: nvarchar(1000)            -- → name
ManufacturerId: int             -- → supplier_id
CategoryId: int                 -- → category_id
TypeId: int                     -- (deprecated)
PriceType: int                  -- (deprecated)
PriceTypeValue: decimal         -- → price
CurrencyCode: nvarchar          -- → currency
Description: nvarchar           -- → description
MinStock: int                   -- → min_stock
IsArchive: bit                  -- → is_active (inverted)
ManufacturerBarcodes: nvarchar  -- → barcode
```

### Заказы (Order)

```sql
OrderId: int [PK]
Status: int                     -- → status (mapped)
CreatedDateUtc: datetime2       -- → created_at
OutletId: int                   -- → warehouse_id
Username: nvarchar(100)         -- → customer_name
Comment: nvarchar               -- → notes
PaymentType: int                -- → payment_method (mapped)
LoyaltyCardNumber: nvarchar     -- → loyalty_card
```

### Товары в заказе (OrderProduct)

```sql
OrderProductId: int [PK]
OrderId: int                    -- → order_id
ProductId: int                  -- → product_id
PurchasePrice: decimal          -- → cost_price
Price: decimal                  -- → unit_price
Count: int                      -- → quantity
ConsignmentNoteId: int          -- → (reference for cost calc)
RefundCount: int                -- → (for returns tracking)
```

---

## 🔄 Сопоставление типов данных

| MS SQL Server | PostgreSQL/Supabase | Примечания |
|---------------|---------------------|------------|
| `int` (PK) | `uuid` | Генерация UUID v5 на основе старого ID |
| `nvarchar` | `varchar` или `text` | Unicode поддерживается |
| `datetime2` | `timestamptz` | UTC timezone |
| `decimal` | `decimal(12,2)` | Для цен и сумм |
| `bit` | `boolean` | true/false |
| `int` (enum) | `enum` или `varchar` | Статусы маппятся |

---

## 🗺️ Сопоставление статусов

### Статусы заказов

| Старый (int) | Новый (enum) | Описание |
|--------------|--------------|----------|
| 0 | `pending` | Создан |
| 1 | `processing` | В обработке |
| 2 | `completed` | Выполнен |
| 3 | `cancelled` | Отменен |
| 4 | `refunded` | Возврат |

### Типы оплаты

| Старый (int) | Новый (enum) |
|--------------|--------------|
| 0 | `cash` |
| 1 | `card` |
| 2 | `online` |
| 3 | `transfer` |

---

## 📁 Извлеченные данные

Все данные экспортированы в JSON формате:

```
docs/base/extracted_data/
├── schema.json                    # Структура всех таблиц
├── dbo_Product.json              # 1,102 товара
├── dbo_ProductCategory.json      # 13 категорий
├── dbo_Manufacturer.json         # 64 производителя
├── dbo_Supplier.json             # 18 поставщиков
├── dbo_Location.json             # 9 складов
├── dbo_Outlet.json               # 3 торговые точки
├── dbo_ConsignmentNote.json      # 976 накладных
├── dbo_ConsignmentNoteProduct.json  # 1,973 позиции
├── dbo_Order.json                # 5,173 заказа
├── dbo_OrderProduct.json         # 6,259 позиций заказов
├── dbo_WriteOff.json             # 246 списаний
├── dbo_ProductLocation.json      # 1,080 остатков
└── dbo_UserActivityLog.json      # 10,192 лога (не мигрируется)
```

---

## 🚀 Скрипты миграции

### Созданные файлы

1. **`scripts/restore_and_extract.py`** - Восстановление бэкапа и извлечение данных
2. **`scripts/migrate_backup_to_supabase.py`** - Генерация SQL миграции

### Использование

```bash
# Установить переменные окружения
export MIGRATION_COMPANY_ID='your-company-uuid'
export MIGRATION_USER_ID='your-user-uuid'

# Сгенерировать SQL миграцию
python scripts/migrate_backup_to_supabase.py

# Применить миграцию
psql $DATABASE_URL -f docs/base/migration_sql/migration_YYYYMMDD_HHMMSS.sql
```

---

## ⚠️ Важные замечания

### Что мигрируется:
- ✅ Товары с категориями
- ✅ Производители и поставщики
- ✅ Склады и торговые точки
- ✅ Заказы и их позиции
- ✅ Приходные накладные
- ✅ Списания товаров

### Что НЕ мигрируется:
- ❌ Пользователи (нужно сопоставление с auth.users)
- ❌ Лог активности (UserActivityLog)
- ❌ История миграций EF Core
- ❌ Связанные клиенты (нет таблицы customers в исходной БД)

### Требующие внимания:
1. **UUID конверсия** - все int ID конвертируются в UUID детерминированно (UUID v5)
2. **Цены закупки** - берутся из ConsignmentNoteProduct
3. **Остатки** - нужен пересчет из ProductLocation
4. **Клиенты** - в исходной БД нет таблицы клиентов, только Username в заказах

---

## 📈 Статистика миграции

| Сущность | Количество | Размер JSON |
|----------|------------|-------------|
| Товары | 1,102 | 576 KB |
| Заказы | 5,173 | 1.2 MB |
| Позиции заказов | 6,259 | 1.3 MB |
| Накладные | 976 | 143 KB |
| Всего записей | ~28,000 | ~8 MB |

---

## 🔧 Рекомендации по применению

1. **Тестовый запуск** - выполнить миграцию на тестовой базе сначала
2. **Бэкап** - создать бэкап целевой Supabase базы
3. **Проверка** - сверить количество записей после миграции
4. **Индексация** - пересоздать индексы после массовой вставки
5. **Констрейнты** - временно отключить проверку внешних ключей

---

## 📞 Поддержка

При возникновении проблем:
1. Проверить логи генерации SQL
2. Проверить маппинг ID в `id_mapping_*.json`
3. Проверить консистентность данных в исходных JSON
