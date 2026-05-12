# prorab-leads (Cloudflare Worker)

Принимает заявки из миниапки `lp-miniapp/` и отправляет их в Telegram админу.

## Что делает

- `POST /lead` — валидирует HMAC initData (Telegram WebApp), отбрасывает старые `auth_date`, отправляет `sendMessage` в чат админа через Bot API
- `GET /healthz` — `{ ok: true, version }`
- `GET /` — `prorab-leads ok`

## Установка и деплой

```bash
cd worker
npm install
npx wrangler login                                # OAuth в браузере (или через `wrangler login --browser=false`)
npx wrangler secret put BOT_TOKEN                 # токен @prorab_ai_bot
npx wrangler secret put ADMIN_CHAT_ID             # numeric id Серёги
npx wrangler deploy
```

После деплоя URL вида `https://prorab-leads.<account>.workers.dev` — пропиши в `VITE_WORKER_URL` миниапки.

## Локальная разработка

```bash
npx wrangler dev
```

Использует `.dev.vars` (создай руками):
```
BOT_TOKEN=...
ADMIN_CHAT_ID=...
```

## Логи

```bash
npx wrangler tail
```

## Rate-limit (опционально)

В `wrangler.toml` раскомментировать `[[kv_namespaces]]`, создать KV:

```bash
npx wrangler kv namespace create RATE_LIMIT
# скопировать id в wrangler.toml
```
