# Carpe Diem Agency — сайт креативного digital-агентства

Next.js 14 (App Router) + TypeScript + Tailwind + SQLite (`node:sqlite`) + NextAuth v5.

## Быстрый старт

Требования: Node.js 22.5+ (рекомендуется 24+) — используется встроенный `node:sqlite`.

```bash
cp .env.example .env.local   # отредактировать ADMIN_EMAIL/ADMIN_PASSWORD/AUTH_SECRET
npm install
npm run seed                 # демо-разделы и работы (опционально)
npm run dev                  # http://localhost:3000
```

Прод-сборка:

```bash
npm run build
npm start
```

## Админка

`/admin/login` — вход по логину/паролю из `.env.local` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

Разделы админки:

- **Обзор** — быстрые метрики и последние заявки.
- **Разделы** — CRUD разделов галереи. Каждый раздел сразу появляется как фильтр на `/gallery`.
- **Работы** — загрузка изображений (до 8 МБ: JPG/PNG/WEBP/GIF/AVIF) и привязка к разделу. Можно вставить внешний URL.
- **Заявки** — входящие лиды с сайта: пометка «Обработано» / удаление / фильтры.

## Структура

```
app/
  page.tsx              # лендинг
  gallery/page.tsx      # публичная галерея с фильтрами
  admin/                # защищённая админка
  api/                  # REST-эндпоинты (sections, works, leads, upload, auth)
components/             # SiteHeader, SiteFooter, LeadForm, Logo
lib/db.ts               # node:sqlite helpers + миграции
auth.ts                 # NextAuth конфиг (credentials)
middleware.ts           # защита /admin/*
public/uploads/         # загруженные изображения
data/cd.db              # SQLite база (создаётся автоматически)
```

## Брендинг

- **Цвета:** Midnight Black `#0A0A0B`, Electric Orange `#FF5A1F`, Spark Yellow `#FFC300`, Clean White `#FAFAF7`
- **Шрифты:** Inter (sans) + Playfair Display (display, italic) — подтягиваются через `next/font`.
- **Tone of Voice:** Proactive & Sharp. Дерзко, без «воды».

## Замечания

- `node:sqlite` всё ещё помечен как экспериментальный — при запуске Node выводит warning, это не ошибка.
- Для продакшена обязательно замените `AUTH_SECRET` и `ADMIN_PASSWORD` на сильные значения. `AUTH_SECRET` можно сгенерировать: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- Изображения в `public/uploads/` не коммитятся (см. `.gitignore`). Для горизонтального масштабирования вынесите хранилище в S3-совместимое.
