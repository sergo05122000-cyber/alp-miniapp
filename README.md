# lp-miniapp

Telegram Mini App агентства **prorab.ai** — каталог-витрина "ИИ-агент под ключ" для малого бизнеса.

Часть монорепо `agency/`. Дизайн и тон скопирован с лендинга `sales/lp/`.

## Стек

- TypeScript + Vite, без React
- `@twa-dev/sdk` для Telegram WebApp API (MainButton, BackButton, HapticFeedback)
- Hash-router, 6 экранов (Home, Who, Included, Options, Demo, Contact)
- Cloudflare Worker для приёма заявок (`worker/` подпапка)
- GitHub Pages для хостинга

## Локальный запуск

```bash
npm install
npm run dev    # http://localhost:5173/lp-miniapp/
```

В браузере без Telegram работает в mock-режиме — нет MainButton, нет initData, форма submit логирует payload в console.

## Сборка и деплой

```bash
npm run build  # dist/
```

Авто-деплой на GitHub Pages через `.github/workflows/deploy.yml` при push в `main`.

URL после деплоя: `https://<user>.github.io/lp-miniapp/`

## Конфигурация

В `.env` (создать из `.env.example`):

```
VITE_WORKER_URL=https://prorab-leads.workers.dev
```

Без этой переменной форма заявки работает в mock-режиме (console.warn).

## Worker (приём заявок)

См. `worker/README.md`. Деплой через `wrangler deploy` после `wrangler login` и `wrangler secret put BOT_TOKEN`.

## Регистрация в BotFather

После деплоя:

1. `/newbot` → `@prorab_ai_bot` (или иной juzzer)
2. `/setmenubutton` → URL миниапки (https://...github.io/lp-miniapp/)
3. `/setdescription`, `/setabouttext`, `/setuserpic`

## Структура

```
src/
├── main.ts              entry: bootWebApp + router
├── router.ts            hash-router, BackButton sync
├── telegram.ts          @twa-dev/sdk wrapper + browser mock
├── api.ts               submitLead → Worker
├── config.ts            URLs, прайс
├── styles/              tokens / base / components
├── components/          dom helpers (el, frag), section, list, priceBlock, mainCta
├── views/               home, who, included, options, demo, contact
└── types/               TS types

worker/
├── src/index.ts         Worker: validate initData, sendMessage
├── wrangler.toml
└── tsconfig.json

.github/workflows/
└── deploy.yml           build + deploy to GH Pages
```
