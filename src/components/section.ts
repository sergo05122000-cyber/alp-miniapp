import { el } from './dom';

export function section(title: string, body: Node): HTMLElement {
  return el('section', { class: 'section' }, [
    el('h2', { class: 'section__title' }, [title]),
    body,
  ]);
}
