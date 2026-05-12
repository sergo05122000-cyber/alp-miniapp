import { el } from '../components/dom';
import { priceBlock } from '../components/priceBlock';
import { bindMainCta } from '../components/mainCta';
import { navigate, type RouteName } from '../router';
import { tg } from '../telegram';
import { CONFIG } from '../config';

interface NavItem {
  label: string;
  route: RouteName;
}

const NAV: NavItem[] = [
  { label: 'Кому подходит', route: 'who' },
  { label: 'Что входит', route: 'included' },
  { label: 'Опции', route: 'options' },
  { label: 'Демо', route: 'demo' },
];

function navCard(item: NavItem): HTMLElement {
  return el(
    'button',
    {
      class: 'nav-card',
      type: 'button',
      onclick: () => {
        tg.HapticFeedback.impactOccurred('light');
        navigate(item.route);
      },
    },
    [
      el('span', undefined, [item.label]),
      el('span', { class: 'nav-card__arrow' }, ['→']),
    ]
  );
}

function footerLink(label: string, url: string): HTMLElement {
  return el(
    'a',
    {
      class: 'footer-link',
      href: url,
      onclick: (e: Event) => {
        e.preventDefault();
        tg.openTelegramLink(url);
      },
    },
    [
      el('span', undefined, [label]),
      el('span', { class: 'footer-link__arrow' }, ['↗']),
    ]
  );
}

export function homeView(root: HTMLElement): () => void {
  root.append(
    el('section', { class: 'hero' }, [
      el('span', { class: 'badge' }, ['prorab.ai · Феодосия']),
      el('h1', undefined, [
        'ИИ-агент ',
        el('span', { class: 'accent' }, ['для вашего бизнеса']),
        ' под ключ',
      ]),
      el('p', { class: 'hero__lead' }, [
        'Программа с мозгом. Отвечает клиентам 24/7 в Telegram, собирает заявки, передаёт вам сложное. Заменяет часть работы администратора.',
      ]),
    ]),
    priceBlock(),
    el(
      'div',
      { class: 'nav-grid' },
      NAV.map(navCard)
    ),
    el('div', { class: 'footer-links' }, [
      footerLink('Наш канал @road_iishnika', CONFIG.CHANNEL_URL),
      footerLink('Написать лично @and_sergey', CONFIG.ADMIN_URL),
    ])
  );

  return bindMainCta(root, 'Оставить заявку', 'contact');
}
