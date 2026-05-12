import { tg } from './telegram';

export type RouteName = 'home' | 'who' | 'included' | 'options' | 'demo' | 'contact';

type ViewFn = (root: HTMLElement) => void | (() => void);

const HASH_TO_ROUTE: Record<string, RouteName> = {
  '': 'home',
  '#/': 'home',
  '#/who': 'who',
  '#/included': 'included',
  '#/options': 'options',
  '#/demo': 'demo',
  '#/contact': 'contact',
};

const ROUTE_TO_HASH: Record<RouteName, string> = {
  home: '#/',
  who: '#/who',
  included: '#/included',
  options: '#/options',
  demo: '#/demo',
  contact: '#/contact',
};

const views: Partial<Record<RouteName, ViewFn>> = {};

let currentTeardown: (() => void) | undefined;
let backHandler: (() => void) | undefined;

function backHandlerImpl(): void {
  navigate('home');
}

function syncBackButton(route: RouteName): void {
  if (route === 'home') {
    tg.BackButton.hide();
    if (backHandler) {
      tg.BackButton.offClick(backHandler);
      backHandler = undefined;
    }
  } else {
    if (!backHandler) {
      backHandler = backHandlerImpl;
      tg.BackButton.onClick(backHandler);
    }
    tg.BackButton.show();
  }
}

function getCurrentRoute(): RouteName {
  return HASH_TO_ROUTE[window.location.hash] ?? 'home';
}

function render(): void {
  const route = getCurrentRoute();
  const view = views[route];
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  currentTeardown?.();
  currentTeardown = undefined;

  app.innerHTML = '';
  syncBackButton(route);

  if (!view) {
    app.innerHTML = `<div class="placeholder"><p class="muted">Экран ${route} ещё не реализован.</p></div>`;
    return;
  }

  const teardown = view(app);
  if (typeof teardown === 'function') {
    currentTeardown = teardown;
  }

  tg.HapticFeedback.impactOccurred('light');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function registerView(name: RouteName, fn: ViewFn): void {
  views[name] = fn;
}

export function navigate(route: RouteName): void {
  const hash = ROUTE_TO_HASH[route];
  if (window.location.hash === hash) {
    render();
  } else {
    window.location.hash = hash;
  }
}

export function startRouter(): void {
  window.addEventListener('hashchange', render);
  render();
}
