import { el } from '../components/dom';
import { bulletList } from '../components/list';
import { bindMainCta } from '../components/mainCta';

const INCLUDED = [
  'Дискавери-звонок и техническое задание',
  'Разработка ИИ-агента под вашу нишу и тон общения',
  'База знаний — вы ведёте в Google-таблице, агент синхронизируется автоматически',
  'Сбор заявок с автоматической передачей вам в Telegram',
  'Передача сложных вопросов на ваш Telegram',
  'Развёртывание на отдельном VPS (включено в цену)',
  'Демо-показ работающего прототипа в середине разработки',
  'Обучение работе с агентом (видео и текст)',
  '3 месяца хостинга и поддержки',
  'Гарантия 30 дней на исправление багов после сдачи',
];

const TERMS = [
  'Аванс 50% при подписании — 15 000 ₽',
  'Остаток 50% после демо и приёмки — 15 000 ₽',
];

export function includedView(root: HTMLElement): () => void {
  root.append(
    el('section', { class: 'hero' }, [
      el('h1', undefined, ['Что входит']),
      el('p', { class: 'summary' }, [
        'Полный цикл от дискавери до запуска. Один продукт, одна цена, один срок.',
      ]),
      bulletList(INCLUDED, true),
      el('h3', { style: 'margin-top: 32px;' }, ['Условия оплаты']),
      bulletList(TERMS, true),
    ])
  );
  return bindMainCta(root, 'Оставить заявку', 'contact');
}
