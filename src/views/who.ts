import { el } from '../components/dom';
import { bulletList } from '../components/list';
import { bindMainCta } from '../components/mainCta';

const NICHES = [
  'Стоматологии, парикмахерские, салоны красоты, автосервисы',
  'Агентства недвижимости и риелторы',
  'Кафе и доставка',
  'Образовательные центры и репетиторы',
  'B2B-услуги с долгим циклом сделки',
  'Профессионалы, которые работают один на один с клиентами и не успевают отвечать',
];

export function whoView(root: HTMLElement): () => void {
  root.append(
    el('section', { class: 'hero' }, [
      el('h1', undefined, ['Кому подходит']),
      el('p', { class: 'summary' }, [
        'Малому и среднему бизнесу, который захлёбывается в одинаковых вопросах клиентов.',
      ]),
      bulletList(NICHES, true),
    ])
  );
  return bindMainCta(root, 'Оставить заявку', 'contact');
}
