export const setupMobileMenu = (
  menuToggle: HTMLButtonElement,
  mobileMenu: HTMLElement,
): void => {
  const setOpen = (isOpen: boolean): void => {
    mobileMenu.classList.toggle("mobile-menu--open", isOpen);
    menuToggle.classList.toggle("menu-toggle--open", isOpen);

    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("mobile-menu--open");

    setOpen(isOpen);
  });

  const menuLinks: NodeListOf<HTMLAnchorElement> =
    mobileMenu.querySelectorAll(".mobile-menu__link");

  for (const link of menuLinks) {
    link.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      const href: string = link.href;

      setOpen(false);

      mobileMenu.addEventListener(
        "transitionend",
        () => {
          window.location.href = href;
        },
        { once: true },
      );
    });
  }

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (
      event.key === "Escape" &&
      mobileMenu.classList.contains("mobile-menu--open")
    ) {
      setOpen(false);
      menuToggle.focus();
    }
  });
};
