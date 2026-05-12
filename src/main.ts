import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { bootWebApp } from './telegram';
import { registerView, startRouter } from './router';
import { homeView } from './views/home';
import { whoView } from './views/who';
import { includedView } from './views/included';
import { optionsView } from './views/options';
import { demoView } from './views/demo';
import { contactView } from './views/contact';

bootWebApp();

registerView('home', homeView);
registerView('who', whoView);
registerView('included', includedView);
registerView('options', optionsView);
registerView('demo', demoView);
registerView('contact', contactView);

startRouter();
