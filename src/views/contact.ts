import { el } from '../components/dom';
import { tg, isTelegram, getTgUser } from '../telegram';
import { submitLead } from '../api';
import { navigate } from '../router';

interface FormState {
  name: string;
  contact: string;
  task: string;
}

function isValid(state: FormState): boolean {
  return state.name.trim().length >= 2 && state.contact.trim().length >= 3;
}

export function contactView(root: HTMLElement): () => void {
  const user = getTgUser();
  const prefillContact = user?.username ? `@${user.username}` : '';
  const prefillName = user?.first_name ?? '';

  const state: FormState = {
    name: prefillName,
    contact: prefillContact,
    task: '',
  };

  const nameInput = el('input', {
    class: 'form-input',
    type: 'text',
    placeholder: 'Как к вам обращаться',
    value: state.name,
    autocomplete: 'name',
  });

  const contactInput = el('input', {
    class: 'form-input',
    type: 'text',
    placeholder: 'Телефон или @username',
    value: state.contact,
  });

  const taskInput = el('textarea', {
    class: 'form-textarea',
    placeholder: 'Что за бизнес, какая задача? (опционально)',
    rows: 3,
  });

  const contactHint = prefillContact
    ? el('div', { class: 'form-hint' }, ['Подставили ваш TG. Можно заменить на телефон.'])
    : null;

  const errorBox = el('div', { class: 'form-error', style: 'display: none;' });
  const submittingBox = el('div', { class: 'form-hint', style: 'display: none;' }, ['Отправляем заявку...']);
  const fallbackBtn = el(
    'button',
    { class: 'cta', type: 'button', style: isTelegram ? 'display:none;' : '' },
    ['Отправить']
  );

  function updateMainBtn(): void {
    if (!isTelegram) {
      (fallbackBtn as HTMLButtonElement).disabled = !isValid(state);
      return;
    }
    if (isValid(state)) {
      tg.MainButton.enable();
    } else {
      tg.MainButton.disable();
    }
  }

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.style.display = '';
    tg.HapticFeedback.notificationOccurred('error');
  }

  function clearError(): void {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }

  async function handleSubmit(): Promise<void> {
    if (!isValid(state)) return;
    clearError();
    submittingBox.style.display = '';
    if (isTelegram) tg.MainButton.showProgress();

    const result = await submitLead(state);

    submittingBox.style.display = 'none';
    if (isTelegram) tg.MainButton.hideProgress();

    if (result.ok) {
      tg.HapticFeedback.notificationOccurred('success');
      tg.showPopup(
        {
          title: 'Заявка принята',
          message: 'Ответим в Telegram в течение часа в рабочее время. До связи.',
          buttons: [{ type: 'close', text: 'Закрыть' }],
        },
        () => {
          if (isTelegram) {
            tg.close();
          } else {
            navigate('home');
          }
        }
      );
    } else {
      showError(`Не получилось отправить: ${result.error}. Напишите нам в @and_sergey.`);
    }
  }

  (nameInput as HTMLInputElement).addEventListener('input', () => {
    state.name = (nameInput as HTMLInputElement).value;
    updateMainBtn();
  });
  (contactInput as HTMLInputElement).addEventListener('input', () => {
    state.contact = (contactInput as HTMLInputElement).value;
    updateMainBtn();
  });
  (taskInput as HTMLTextAreaElement).addEventListener('input', () => {
    state.task = (taskInput as HTMLTextAreaElement).value;
  });

  fallbackBtn.addEventListener('click', () => {
    void handleSubmit();
  });

  root.append(
    el('section', { class: 'hero' }, [
      el('h1', undefined, ['Связаться']),
      el('p', { class: 'summary' }, [
        'Имя и как с вами связаться. Ответим в Telegram в течение часа в рабочее время. Ничего не продаём, если задача не подходит — скажем сразу.',
      ]),
      el('div', { class: 'form-field' }, [
        el('label', { class: 'form-label' }, ['Имя']),
        nameInput,
      ]),
      (() => {
        const field = el('div', { class: 'form-field' }, [
          el('label', { class: 'form-label' }, ['Контакт']),
          contactInput,
        ]);
        if (contactHint) field.append(contactHint);
        return field;
      })(),
      el('div', { class: 'form-field' }, [
        el('label', { class: 'form-label' }, ['Задача (необязательно)']),
        taskInput,
      ]),
      submittingBox,
      errorBox,
      fallbackBtn,
    ])
  );

  let teardownMainBtn: () => void = () => {};

  if (isTelegram) {
    const onClick = (): void => {
      void handleSubmit();
    };
    tg.MainButton.setText('Отправить');
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
    teardownMainBtn = () => {
      tg.MainButton.offClick(onClick);
      tg.MainButton.hide();
    };
  }

  updateMainBtn();

  return () => {
    teardownMainBtn();
  };
}
