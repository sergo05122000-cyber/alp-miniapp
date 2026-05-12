import { el } from './dom';

export function bulletList(items: string[], plain = false): HTMLUListElement {
  return el(
    'ul',
    { class: plain ? 'list list--plain' : 'list' },
    items.map((text) => el('li', undefined, [text]))
  );
}

export function priceList(items: Array<{ label: string; price: string }>): HTMLUListElement {
  return el(
    'ul',
    { class: 'list list--plain' },
    items.map((item) =>
      el('li', undefined, [
        item.label,
        ' — ',
        el('span', { class: 'accent' }, [item.price]),
      ])
    )
  );
}
