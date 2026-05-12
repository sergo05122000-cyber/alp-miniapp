import { el } from './dom';
import { CONFIG } from '../config';

export function priceBlock(): HTMLElement {
  return el('div', { class: 'card card--center' }, [
    el('h3', undefined, ['ИИ-агент под ключ']),
    el('div', { class: 'price price--large' }, [CONFIG.PRICE]),
    el('div', { class: 'term' }, [`Срок: ${CONFIG.TERM}`]),
  ]);
}
