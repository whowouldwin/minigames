import './main-navigation.scss';

const navigationItems: readonly string[] = [
    'Home',
    'Library',
    'Tournaments',
    'Community',
];

export const createMainNavigation = (): HTMLElement => {
    const navigation: HTMLElement = document.createElement('nav');

    navigation.className = 'main-navigation';
    navigation.setAttribute('aria-label', 'Main navigation');

    const list: HTMLUListElement = document.createElement('ul');

    list.className = 'main-navigation__list';

    for (const label of navigationItems) {
        const item: HTMLLIElement = document.createElement('li');
        const link: HTMLAnchorElement = document.createElement('a');

        link.className = 'main-navigation__link';
        link.href = './';
        link.textContent = label;

        if (label === 'Home') {
            link.classList.add('main-navigation__link--active');
            link.setAttribute('aria-current', 'page');
        }

        item.append(link);
        list.append(item);
    }

    navigation.append(list);

    return navigation;
};