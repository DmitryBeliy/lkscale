# GitHub Actions CI/CD

Этот документ описывает настройку GitHub Actions для автоматической сборки, тестирования и деплоя Lkscale ERP.

## 📋 Содержание

- [Обзор workflow](#обзор-workflow)
- [Настройка секретов](#настройка-секретов)
- [Workflow файлы](#workflow-файлы)
- [Описание процессов](#описание-процессов)

## 🔄 Обзор workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Pull Request  │────▶│  Build & Test   │────▶│  Vercel Preview │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                              │
                                                              ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   EAS Update    │◀────│  Merge to main  │◀────│  Deploy Prod    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🔐 Настройка секретов

### GitHub Secrets

Перейдите в **Settings** → **Secrets and variables** → **Actions** и добавьте:

#### Обязательные секреты

| Secret | Описание | Где получить |
|--------|----------|--------------|
| `SUPABASE_URL` | URL проекта Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Публичный API ключ | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Сервисный ключ | Supabase Dashboard → Settings → API |
| `EXPO_TOKEN` | Токен для EAS | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) |
| `VERCEL_TOKEN` | Токен Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |

#### Опциональные секреты

| Secret | Описание | Где получить |
|--------|----------|--------------|
| `SENTRY_AUTH_TOKEN` | Токен Sentry | Sentry Settings → Auth Tokens |
| `SENTRY_ORG` | Организация Sentry | Sentry Dashboard |
| `SENTRY_PROJECT` | Проект Sentry | Sentry Dashboard |
| `OPENAI_API_KEY` | Ключ OpenAI | OpenAI Dashboard |

### GitHub Variables

Перейдите в **Settings** → **Secrets and variables** → **Actions** → **Variables**:

| Variable | Значение |
|----------|----------|
| `VERCEL_ORG_ID` | ID организации Vercel |
| `VERCEL_PROJECT_ID` | ID проекта Vercel |
| `EAS_PROJECT_ID` | ID проекта EAS |

## 📁 Workflow файлы

Создайте директорию `.github/workflows/` и файлы:

### 1. `ci.yml` - Проверка PR

```yaml
name: CI - Build & Test

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage --watchAll=false
        continue-on-error: true

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build-web:
    name: Build Web
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web
        run: npx expo export --platform web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/
          retention-days: 1
```

### 2. `vercel-preview.yml` - Preview деплой

```yaml
name: Vercel Preview Deployment

on:
  pull_request:
    branches: [main, develop]

env:
  VERCEL_ORG_ID: ${{ vars.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ vars.VERCEL_PROJECT_ID }}

jobs:
  deploy-preview:
    name: Deploy Preview to Vercel
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ steps.deploy.outputs.url }}';
            const commit = context.sha.substring(0, 7);
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **Preview deployed!**\n\n🔗 [View Preview](${url})\n📋 Commit: \`${commit}\``
            });
```

### 3. `vercel-production.yml` - Production деплой

```yaml
name: Vercel Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ vars.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ vars.VERCEL_PROJECT_ID }}

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Create Sentry Release
        if: ${{ secrets.SENTRY_AUTH_TOKEN != '' }}
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          sourcemaps: ./dist
```

### 4. `eas-build.yml` - EAS сборка мобильных приложений

```yaml
name: EAS Build

on:
  push:
    branches: [main]
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - android
          - ios
      profile:
        description: 'Build profile'
        required: true
        default: 'production'
        type: choice
        options:
          - development
          - preview
          - production

jobs:
  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    if: ${{ github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android' || github.event_name == 'push' }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build Android
        run: eas build --platform android --profile ${{ github.event.inputs.profile || 'production' }} --non-interactive
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  build-ios:
    name: Build iOS
    runs-on: macos-latest
    if: ${{ github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios' || github.event_name == 'push' }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build iOS
        run: eas build --platform ios --profile ${{ github.event.inputs.profile || 'production' }} --non-interactive
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  publish-update:
    name: Publish OTA Update
    runs-on: ubuntu-latest
    needs: [build-android, build-ios]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Publish update
        run: eas update --auto --non-interactive
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### 5. `supabase-deploy.yml` - Деплой базы данных

```yaml
name: Supabase Database Deploy

on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'
      - '.github/workflows/supabase-deploy.yml'
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy Database
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push database changes
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Apply seed (optional, only for staging)
        if: github.ref != 'refs/heads/main'
        run: |
          supabase db seed reset --linked || true
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 6. `release.yml` - Создание релиза

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          echo "CHANGELOG<<EOF" >> $GITHUB_OUTPUT
          git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 HEAD~1)..HEAD >> $GITHUB_OUTPUT
          echo "" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## Changes
            ${{ steps.changelog.outputs.CHANGELOG }}
            
            ## Installation
            - Web: https://lkscale.vercel.app
            - iOS: App Store (pending review)
            - Android: Play Store (pending review)
          draft: false
          prerelease: ${{ contains(github.ref, 'beta') || contains(github.ref, 'alpha') }}
```

## 📊 Описание процессов

### Pull Request Workflow

1. **Создание PR** → Запускается `ci.yml`
2. **Lint & Type Check** → Проверка кода
3. **Unit Tests** → Запуск тестов с coverage
4. **Build** → Сборка web версии
5. **Vercel Preview** → Автодеплой preview
6. **Комментарий в PR** → Ссылка на preview

### Merge в main

1. **Слияние PR** → Запускаются все workflow
2. **Production Deploy** → Деплой на Vercel
3. **EAS Build** → Сборка Android и iOS
4. **OTA Update** → Публикация обновления
5. **Database Deploy** → Применение миграций
6. **GitHub Release** → Создание релиза (для тегов)

### Ручной запуск

```bash
# Web preview
gh workflow run vercel-preview.yml

# Production deploy
gh workflow run vercel-production.yml

# EAS Build
gh workflow run eas-build.yml -f platform=all -f profile=production

# Database deploy
gh workflow run supabase-deploy.yml
```

## 🔍 Устранение неполадок

### Проблемы с Vercel

```bash
# Перелинковать проект
vercel link

# Проверить токен
vercel whoami
```

### Проблемы с EAS

```bash
# Проверить авторизацию
eas whoami

# Обновить credentials
eas credentials:sync
```

### Проблемы с Supabase

```bash
# Проверить статус
supabase status

# Пересоздать локальную БД
supabase db reset

# Проверить миграции
supabase migration list
```

## 📈 Мониторинг

### Дашборды

- **Vercel**: https://vercel.com/dashboard
- **EAS**: https://expo.dev/accounts/[account]/projects/[project]
- **Supabase**: https://app.supabase.com/project/[project-id]
- **Sentry**: https://sentry.io/organizations/[org]/projects/[project]

### Алерты

Настройте алерты в:
- Vercel: Settings → Alerts
- Supabase: Database → Alerts
- Sentry: Settings → Alerts

## 📝 Примечания

1. **Environment Protection**: Настройте protection rules для production environment
2. **Required Checks**: Включите required status checks для main ветки
3. **Branch Protection**: Запретите прямой push в main
4. **Secrets Rotation**: Обновляйте секреты каждые 90 дней
