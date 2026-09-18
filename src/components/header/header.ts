import { createSiteLogo } from '../ui/site-logo';
import { createMainNavigation } from '../navigation/main-navigation';

import './header.scss';

export const createHeader = (): HTMLElement => {
    const header: HTMLElement = document.createElement('header');

    header.className = 'header';

    const actions: HTMLDivElement = document.createElement('div');

    actions.className = 'header__actions';
    actions.append(createMainNavigation());

    header.append(createSiteLogo(), actions);

    return header;
};