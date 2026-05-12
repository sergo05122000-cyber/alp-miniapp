import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    <div class="placeholder">
      <p class="muted">prorab.ai — миниапка собирается. UI приедет в фазе 6+.</p>
    </div>
  `;
}
