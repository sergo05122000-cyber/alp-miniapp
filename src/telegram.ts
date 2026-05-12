/**
 * Telegram WebApp wrapper.
 * Safe defaults + browser fallback so `npm run dev` works without TG.
 */

import type { TelegramUserSnapshot } from './types/lead';

type HapticImpact = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotification = 'error' | 'success' | 'warning';

interface MainButton {
  text: string;
  isVisible: boolean;
  isActive: boolean;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  setText(text: string): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
}

interface BackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface HapticFeedback {
  impactOccurred(style: HapticImpact): void;
  notificationOccurred(type: HapticNotification): void;
  selectionChanged(): void;
}

interface PopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

interface WebAppLike {
  version: string;
  initData: string;
  initDataUnsafe: { user?: TelegramUserSnapshot };
  themeParams: Record<string, string>;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: MainButton;
  BackButton: BackButton;
  HapticFeedback: HapticFeedback;
  ready(): void;
  expand(): void;
  close(): void;
  openTelegramLink(url: string): void;
  showPopup(params: { title?: string; message: string; buttons?: PopupButton[] }, cb?: (id: string) => void): void;
  showAlert(message: string, cb?: () => void): void;
  isVersionAtLeast(version: string): boolean;
  disableVerticalSwipes?(): void;
  onEvent(eventType: string, cb: () => void): void;
  offEvent(eventType: string, cb: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: WebAppLike };
  }
}

function createMockButton(): MainButton {
  const listeners = new Set<() => void>();
  return {
    text: '',
    isVisible: false,
    isActive: false,
    show() {
      this.isVisible = true;
    },
    hide() {
      this.isVisible = false;
    },
    enable() {
      this.isActive = true;
    },
    disable() {
      this.isActive = false;
    },
    setText(text: string) {
      this.text = text;
    },
    onClick(cb: () => void) {
      listeners.add(cb);
    },
    offClick(cb: () => void) {
      listeners.delete(cb);
    },
    showProgress() {
      /* noop */
    },
    hideProgress() {
      /* noop */
    },
  };
}

function createMockBackButton(): BackButton {
  const listeners = new Set<() => void>();
  return {
    isVisible: false,
    show() {
      this.isVisible = true;
    },
    hide() {
      this.isVisible = false;
    },
    onClick(cb: () => void) {
      listeners.add(cb);
    },
    offClick(cb: () => void) {
      listeners.delete(cb);
    },
  };
}

function createMockWebApp(): WebAppLike {
  return {
    version: '0.0',
    initData: '',
    initDataUnsafe: {},
    themeParams: {},
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    MainButton: createMockButton(),
    BackButton: createMockBackButton(),
    HapticFeedback: {
      impactOccurred: () => {},
      notificationOccurred: () => {},
      selectionChanged: () => {},
    },
    ready: () => {},
    expand: () => {},
    close: () => window.close(),
    openTelegramLink: (url: string) => {
      window.open(url, '_blank');
    },
    showPopup: (params, cb) => {
      window.alert(params.message);
      cb?.('ok');
    },
    showAlert: (msg, cb) => {
      window.alert(msg);
      cb?.();
    },
    isVersionAtLeast: () => false,
    onEvent: () => {},
    offEvent: () => {},
  };
}

const realWebApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
const isReal = Boolean(realWebApp && realWebApp.initData !== undefined);

export const tg: WebAppLike = realWebApp ?? createMockWebApp();
export const isTelegram = isReal;

export function getTgUser(): TelegramUserSnapshot | null {
  const user = tg.initDataUnsafe.user;
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

/**
 * Apply viewport-stable-height to CSS var so 100vh works on iOS Telegram.
 */
export function bindViewport(): void {
  const update = (): void => {
    const h = tg.viewportStableHeight || window.innerHeight;
    document.documentElement.style.setProperty('--tg-viewport-stable-height', `${h}px`);
  };
  update();
  tg.onEvent('viewportChanged', update);
  window.addEventListener('resize', update);
}

/**
 * Boot the WebApp: ready, expand, disable swipes (if supported), bind viewport.
 */
export function bootWebApp(): void {
  tg.ready();
  tg.expand();
  if (tg.isVersionAtLeast('7.7') && tg.disableVerticalSwipes) {
    tg.disableVerticalSwipes();
  }
  bindViewport();
}
