import { el } from '../components/dom';
import { bindMainCta } from '../components/mainCta';
import { tg } from '../telegram';
import { CONFIG } from '../config';

export function demoView(root: HTMLElement): () => void {
  root.append(
    el('section', { class: 'hero' }, [
      el('h1', undefined, ['Живой агент']),
      el('p', { class: 'summary' }, [
        'У нас работает ИИ-агент для мехштукатурки в Феодосии. Он отвечает клиентам на вопросы про цены, материалы, сроки, собирает заявки на бесплатный замер.',
      ]),
      el('p', undefined, [
        'Это не презентация и не видео — это живой агент в Telegram, с которым вы можете пообщаться прямо сейчас и проверить как он отвечает.',
      ]),
      el(
        'button',
        {
          class: 'cta',
          type: 'button',
          onclick: () => {
            tg.HapticFeedback.impactOccurred('medium');
            tg.openTelegramLink(CONFIG.DEMO_BOT_URL);
          },
        },
        ['Открыть @mehanizatorsten_bot']
      ),
    ])
  );
  return bindMainCta(root, 'Оставить заявку', 'contact');
}
