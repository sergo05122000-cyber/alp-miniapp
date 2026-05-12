export const CONFIG = {
  WORKER_URL: import.meta.env.VITE_WORKER_URL ?? '',
  DEMO_BOT_URL: 'https://t.me/mehanizatorsten_bot',
  CHANNEL_URL: 'https://t.me/road_iishnika',
  ADMIN_URL: 'https://t.me/and_sergey',
  PRICE: '30 000 ₽',
  TERM: '7 рабочих дней',
} as const;
