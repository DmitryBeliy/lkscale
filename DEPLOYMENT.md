# 🚀 Lkscale - Deployment Guide

Руководство по развертыванию приложения Lkscale на различных платформах.

## 📋 Содержание

- [Быстрый старт](#быстрый-старт)
- [Предварительные требования](#предварительные-требования)
- [Настройка окружения](#настройка-окружения)
- [Сборка для Android](#сборка-для-android)
- [Сборка для iOS](#сборка-для-ios)
- [Веб-развертывание](#веб-развертывание)
- [Публикация в магазинах](#публикация-в-магазинах)

---

## Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл

# 3. Сборка development версии
npm run build:dev
```

---

## Предварительные требования

### Установленные инструменты

- [Node.js](https://nodejs.org/) 18+ 
- [npm](https://www.npmjs.com/) или [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/build/setup/): `npm install -g eas-cli`
- [Vercel CLI](https://vercel.com/docs/cli) (для веб-развертывания): `npm install -g vercel`

### Учетные записи

- [Expo account](https://expo.dev/signup)
- [Vercel account](https://vercel.com/signup) (для веб-версии)
- Google Play Console (для Android публикации)
- Apple Developer Account (для iOS публикации)

---

## Настройка окружения

### 1. Создание .env файла

```bash
cp .env.example .env
```

### 2. Заполните переменные окружения:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# EAS Project ID (получите на expo.dev)
EAS_PROJECT_ID=your-project-id
```

### 3. Настройка EAS Project

```bash
# Войдите в Expo аккаунт
eas login

# Создайте новый проект (если еще не создан)
eas project:create

# Или настройте существующий
eas project:init
```

### 4. Обновите EAS Project ID

После создания проекта на [expo.dev](https://expo.dev), обновите:

- `app.json` → `expo.extra.eas.projectId`
- `app.json` → `expo.updates.url`
- `.env` → `EAS_PROJECT_ID`

---

## Сборка для Android

### Development сборка (для тестирования)

```bash
# APK для эмулятора/симулятора
npm run build:dev

# APK для физического устройства
npm run build:dev -- --profile development-device
```

### Preview сборка (APK для тестировщиков)

```bash
# APK для внутреннего тестирования
npm run build:preview

# Play Store Internal Testing (AAB)
npm run build:preview -- --profile preview-playstore
```

### Production сборка

```bash
# AAB для Google Play Store
npm run build:production

# APK
npm run build:android -- --profile production --type apk
```

### Сборка локально (требуется Android SDK)

```bash
eas build --platform android --local
```

---

## Сборка для iOS

### Development сборка

```bash
# Для симулятора
npm run build:dev

# Для физического устройства (требуется Apple Developer аккаунт)
npm run build:dev -- --profile development-device
```

### Production сборка

```bash
npm run build:ios -- --profile production
```

### ⚠️ Требования для iOS

- Apple Developer Account ($99/год)
- Настройте App ID в Apple Developer Portal
- Создайте provisioning profiles
- Обновите `eas.json` с вашим `ascAppId` и `ascTeamId`

---

## Веб-развертывание

### Локальная разработка

```bash
# Запуск веб-сервера разработки
npm run web

# Или
expo start --web
```

### Сборка для production

```bash
npm run build:web
```

Результат сборки будет в папке `dist/`.

### Развертывание на Vercel

```bash
# Первое развертывание
vercel

# Production развертывание
npm run deploy:vercel

# Staging развертывание
npm run deploy:vercel:staging
```

### Автоматическое развертывание

Настройте интеграцию с GitHub в Vercel Dashboard для автоматического деплоя при пуше в main ветку.

---

## Публикация в магазинах

### Google Play Store

#### 1. Подготовка

- Создайте аккаунт Google Play Console ($25 один раз)
- Настройте приложение в консоли
- Заполните информацию о приложении

#### 2. Подпись приложения

```bash
# Сборка AAB
eas build --platform android --profile production

# Или используйте скрипт
npm run build:production
```

#### 3. Публикация

```bash
# Автоматическая отправка в Play Store
eas submit --platform android

# Или
npm run submit:android
```

### Apple App Store

#### 1. Подготовка

- Создайте App ID в Apple Developer Portal
- Настройте App Store Connect
- Создайте новое приложение

#### 2. Сборка и отправка

```bash
# Сборка
npm run build:ios -- --profile production

# Отправка
npm run submit:ios
```

#### 3. Ручная публикация

- Загрузите build через Transporter app
- Или настройте автоматическую отправку в `eas.json`

---

## Конфигурация сборок

### Профили сборки (eas.json)

| Профиль | Назначение | Выходной формат |
|---------|------------|-----------------|
| `development` | Локальная разработка | APK / Simulator |
| `development-device` | Тестирование на устройстве | APK / IPA |
| `preview` | Внутреннее тестирование | APK |
| `preview-playstore` | Play Store Internal | AAB |
| `production` | Production релиз | AAB / IPA |

### Скрипты (package.json)

| Скрипт | Описание |
|--------|----------|
| `npm run build:android` | Сборка Android через EAS |
| `npm run build:ios` | Сборка iOS через EAS |
| `npm run build:web` | Сборка веб-версии |
| `npm run build:dev` | Development сборка |
| `npm run build:preview` | Preview сборка |
| `npm run build:production` | Production сборка |
| `npm run deploy:vercel` | Развертывание на Vercel |
| `npm run submit:android` | Отправка в Play Store |
| `npm run submit:ios` | Отправка в App Store |

---

## Устранение неполадок

### Ошибка: "Project ID not configured"

Убедитесь, что `EAS_PROJECT_ID` заполнен в `app.json` и `.env`.

### Ошибка сборки iOS: "Provisioning profile not found"

1. Проверьте Apple Developer аккаунт
2. Создайте provisioning profiles вручную
3. Или используйте automatic signing: `eas credentials`

### Ошибка: "Supabase URL is not defined"

Убедитесь, что `.env` файл создан и переменные заполнены.

### Очистка кэша

```bash
# Expo cache
expo start --clear

# EAS build cache
eas build --clear-cache

# Полная очистка
rm -rf node_modules .expo dist
npm install
```

---

## CI/CD

### GitHub Actions (пример)

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm install
      - run: eas build --platform all --non-interactive
```

---

## Полезные ссылки

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Vercel Documentation](https://vercel.com/docs)
- [Google Play Console](https://play.google.com/console/developers)
- [App Store Connect](https://appstoreconnect.apple.com/)

---

## Поддержка

При возникновении проблем:

1. Проверьте [Expo Forums](https://forums.expo.dev/)
2. Создайте issue в репозитории
3. Проверьте логи сборки: `eas build:logs`
