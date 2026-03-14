# Lkscale ERP - Project Index

## Дата: 2026-03-11

---

## 1. Выполненные исправления кода

### 1.1. store/authStore.ts
- **Проблема:** Хардкод пароля демо-аккаунта
- **Решение:** Заменено на `process.env.EXPO_PUBLIC_DEMO_PASSWORD`
- **Строка:** 247
- **До:** `const DEMO_PASSWORD = 'Demo123456!';`
- **После:** `const DEMO_PASSWORD = process.env.EXPO_PUBLIC_DEMO_PASSWORD || '';`

### 1.2. lib/logger.ts
- **Проблема:** Тип `NodeJS.Timeout` не кроссплатформенный
- **Решение:** Заменено на `ReturnType<typeof setInterval>`
- **Строка:** 55
- **До:** `private flushInterval: NodeJS.Timeout | null = null;`
- **После:** `private flushInterval: ReturnType<typeof setInterval> | null = null;`

### 1.3. README.md
- **Проблема:** Опечатка в команде копирования
- **Решение:** `.cp` → `cp`
- **Строка:** 204

---

## 2. Деплой

### 2.1. Production URL
- **Vercel:** https://lkscale-f4bvftv4k-234s-projects-4b7ca098.vercel.app
- **Статус:** ✅ Активен

### 2.2. Конфигурация
- **Файл:** `vercel.json`
- **Build Command:** `expo export --platform web`
- **Output Directory:** `dist`

---

## 3. Миграция базы данных

### 3.1. Supabase Project
- **Project ID:** `onnncepenxxxfprqaodu`
- **URL:** https://onnncepenxxxfprqaodu.supabase.co
- **Publishable Key:** `sb_publishable_hQ0xAE3z-6vFOeKAlTwgdA_9enykXiv`

### 3.2. Файлы миграции

#### Схема:
| Файл | Описание | Статус |
|------|----------|--------|
| `docs/base/migration_sql/schema.sql` | Создание таблиц, индексы, RLS | ✅ Готов |
| `docs/base/migration_sql/fix_policies.sql` | Исправление политик | ✅ Готов |
| `docs/base/migration_sql/disable_fk.sql` | Отключение foreign key | ✅ Готов |
| `docs/base/migration_sql/enable_fk.sql` | Включение foreign key | ✅ Готов |

#### Данные (разбиты на части < 400 KB):
| Файл | Содержимое | Размер | Статус |
|------|-----------|--------|--------|
| `part_001.sql` | Категории, поставщики | 292 KB | ✅ Готов |
| `part_002.sql` | Товары (исправлено) | 258 KB | ✅ Готов |
| `part_003.sql` | Заказы (часть 1) | 395 KB | ✅ Готов |
| `part_004.sql` | Заказы (часть 2) | 405 KB | ✅ Готов |
| `part_005.sql` | Заказы (часть 3) | 409 KB | ✅ Готов |
| `part_006.sql` | Позиции заказов (часть 1) | 362 KB | ✅ Готов |
| `part_007.sql` | Позиции заказов (часть 2) | 362 KB | ✅ Готов |
| `part_008.sql` | Позиции заказов (часть 3) | 370 KB | ✅ Готов |
| `part_009.sql` | Инвентарные транзакции | 274 KB | ✅ Готов |

### 3.3. Исправления в миграции

#### Исправление 1: Политики RLS
- **Проблема:** `policy "Users can view own orders" already exists`
- **Решение:** Добавлены `DROP POLICY IF EXISTS` перед созданием

#### Исправление 2: Foreign Key Constraint
- **Проблема:** `violates foreign key constraint "products_manufacturer_id_fkey"`
- **Решение:** 
  - Создан `disable_fk.sql` для отключения constraint
  - `part_002.sql`: manufacturer_id = NULL

#### Исправление 3: Placeholder UUID
- **Проблема:** `invalid input syntax for type uuid: "$1"`
- **Решение:** `'$1'` → `gen_random_uuid()`, `'$2'` → `NULL`

### 3.4. Порядок выполнения миграции

```sql
1. schema.sql          -- Создание таблиц
2. disable_fk.sql      -- Отключение foreign key
3. part_001.sql        -- Категории, поставщики
4. part_002.sql        -- Товары (исправлено)
5. part_003.sql        -- Заказы (часть 1)
6. part_004.sql        -- Заказы (часть 2)
7. part_005.sql        -- Заказы (часть 3)
8. part_006.sql        -- Позиции заказов (часть 1)
9. part_007.sql        -- Позиции заказов (часть 2)
10. part_008.sql       -- Позиции заказов (часть 3)
11. part_009.sql       -- Инвентарные транзакции
12. enable_fk.sql      -- (опционально) Включение foreign key
```

---

## 4. Структура проекта

### 4.1. Основные директории
```
lkscale/
├── app/                    # Expo Router экраны
├── components/             # React компоненты
├── contexts/               # React Contexts
├── docs/                   # Документация
│   ├── base/
│   │   ├── extracted_data/     # Данные из бэкапа
│   │   └── migration_sql/      # SQL миграции
│   └── CODEBASE_INDEX.md
├── lib/                    # Утилиты и сервисы
├── localization/           # Локализация
├── scripts/                # Скрипты
├── services/               # Бизнес-логика
├── store/                  # State management
└── supabase/               # Supabase конфигурация
```

### 4.2. Ключевые файлы
- `.env` — переменные окружения
- `.env.example` — шаблон переменных
- `vercel.json` — конфигурация деплоя
- `app.json` — конфигурация Expo

---

## 5. Скрипты

### 5.1. Деплой
```bash
npm run deploy:vercel              # Деплой на Vercel
npm run build:production           # Production build
```

### 5.2. Миграция
```bash
node scripts/apply-migration.js    # Применение миграций
node scripts/split-migration.js    # Разбиение на части
```

---

## 6. Технический стек

- **Frontend:** React Native, Expo SDK 54
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **State:** Custom Pub/Sub Store
- **Styling:** Tailwind CSS (NativeWind)
- **Deploy:** Vercel (web), EAS (mobile)

---

## 7. Ошибки и их решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| policy already exists | Политика создана повторно | DROP POLICY IF EXISTS |
| foreign key violation | manufacturer_id не существует | Отключить FK или NULL |
| invalid uuid "$1" | Placeholder вместо UUID | gen_random_uuid() |
| Query is too large | SQL > 400 KB | Разбить на части |

---

## 8. Статус задач

- [x] Исправить хардкод пароля
- [x] Исправить тип NodeJS.Timeout
- [x] Исправить опечатку в README
- [x] Деплой на Vercel
- [x] Подготовка миграции БД
- [x] Исправление политик RLS
- [x] Исправление foreign key
- [x] Исправление placeholder UUID
- [ ] Выполнение миграции (требуется действие пользователя)

---

## 9. Ссылки

- **Production:** https://lkscale-f4bvftv4k-234s-projects-4b7ca098.vercel.app
- **Supabase SQL Editor:** https://app.supabase.com/project/onnncepenxxxfprqaodu/sql/new
- **Migration Files:** `docs/base/migration_sql/`
