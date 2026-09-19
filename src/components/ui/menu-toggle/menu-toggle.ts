import './menu-toggle.scss';

export const createMenuToggle = (): HTMLButtonElement => {
    const button: HTMLButtonElement = document.createElement('button');

    button.className = 'menu-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open menu');

    for (let i = 0; i < 3; i += 1) {
        const line: HTMLSpanElement = document.createElement('span');

        line.className = 'menu-toggle__line';
        button.append(line);
    }

    return button;
};