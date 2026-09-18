import './button.scss';

export type ButtonVariant = 'outlined' | 'filled';
export type ButtonSize = 'small' | 'medium' | 'large';

export const createButton = (
    text: string,
    variant: ButtonVariant,
    size: ButtonSize = 'medium',
): HTMLButtonElement => {
    const button: HTMLButtonElement = document.createElement('button');

    button.className = `button button--${variant} button--${size}`;
    button.type = 'button';
    button.textContent = text;

    return button;
};