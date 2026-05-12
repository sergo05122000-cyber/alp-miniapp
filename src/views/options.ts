import { el } from '../components/dom';
import { priceList } from '../components/list';
import { bindMainCta } from '../components/mainCta';

const OPTIONS = [
  { label: 'Веб-чат на сайте', price: '+10 000 ₽' },
  { label: 'Интеграция с CRM (Bitrix24, amoCRM)', price: '+15 000 ₽' },
  { label: 'Голосовой канал через телефонию', price: '+30 000 ₽' },
  { label: 'База знаний от 100 вопросов', price: '+5 000 ₽' },
  { label: 'Продление поддержки сверх 3 месяцев', price: '2 000 ₽/мес' },
];

export function optionsView(root: HTMLElement): () => void {
  root.append(
    el('section', { class: 'hero' }, [
      el('h1', undefined, ['Опции по запросу']),
      el('p', { class: 'summary' }, [
        'Базовый продукт — 30 000 ₽. Если нужно больше каналов или интеграция в вашу CRM — собираем индивидуально.',
      ]),
      priceList(OPTIONS),
    ])
  );
  return bindMainCta(root, 'Оставить заявку', 'contact');
}
