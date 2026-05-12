export interface TelegramUserSnapshot {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface Lead {
  name: string;
  contact: string;
  task: string;
  tgUser: TelegramUserSnapshot | null;
  initData: string;
  source: 'lp-miniapp';
}
