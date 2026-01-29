# Uchiskz

Образовательная платформа на Next.js с локализацией, авторизацией через Clerk и базой данных Postgres через Prisma. Проект хранит предметы, темы и тестовые задания, а также собирает статистику пользователей.

## Переменные окружения

Создайте файл `.env` в корне проекта и заполните необходимые значения:

```bash
# База данных (PostgreSQL/Supabase/Neon)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

# Clerk (обязателен для авторизации)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

> Если используете SQLite для локальной разработки, измените `provider` в `prisma/schema.prisma` и обновите `DATABASE_URL`.

## Настройка Prisma

1. Сгенерировать клиент:
   ```bash
   npx prisma generate
   ```
2. Применить миграции (создать схему БД):
   ```bash
   npx prisma migrate dev
   ```
3. Засеять базу начальными данными:
   ```bash
   npx prisma db seed
   ```

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Деплой

1. Настройте переменные окружения в платформе деплоя (Vercel/Render/Fly/другое).
2. Убедитесь, что переменные `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` заданы.
3. На этапе билда выполняется `prisma generate` и `next build` (см. `npm run build`).
4. Выполните миграции для продакшена (например, через `prisma migrate deploy`).

Пример команды для CI/CD:

```bash
npx prisma migrate deploy
npm run build
npm run start
```

## Основные команды

```bash
npm run dev       # локальная разработка
npm run build     # сборка (включает prisma generate)
npm run start     # запуск production сервера
npm run lint      # линтинг
npx prisma studio # UI для просмотра данных
npx prisma db seed # заполнение базы начальными данными
```
