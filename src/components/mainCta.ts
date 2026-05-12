import { tg, isTelegram } from '../telegram';
import { navigate, type RouteName } from '../router';
import { el } from './dom';

/**
 * Bind the TG MainButton (or render a fallback CTA <button>) to navigate.
 * Returns a teardown function the view should call on unmount.
 */
export function bindMainCta(root: HTMLElement, text: string, target: RouteName): () => void {
  if (isTelegram) {
    const handler = (): void => {
      tg.HapticFeedback.impactOccurred('medium');
      navigate(target);
    };
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.enable();
    tg.MainButton.onClick(handler);
    return () => {
      tg.MainButton.offClick(handler);
      tg.MainButton.hide();
    };
  }

  const button = el(
    'button',
    {
      class: 'cta',
      type: 'button',
      onclick: () => navigate(target),
    },
    [text]
  );
  root.append(button);
  return () => {
    button.remove();
  };
}
