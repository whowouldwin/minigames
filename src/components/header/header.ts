import { createSiteLogo } from '../ui/site-logo';

import './header.scss';

export const createHeader = (): HTMLElement => {
    const header: HTMLElement = document.createElement('header');

    header.className = 'header';
    header.append(createSiteLogo());

    return header;
};