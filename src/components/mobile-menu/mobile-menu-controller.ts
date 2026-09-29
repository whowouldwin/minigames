import type { AuthMode } from "../auth-dialog";

export const setupMobileMenu = (
  menuToggle: HTMLButtonElement,
  mobileMenu: HTMLElement,
  openAuth: (mode: AuthMode) => void,
): void => {
  mobileMenu.id = "mobile-menu";
  mobileMenu.inert = true;
  menuToggle.setAttribute("aria-controls", mobileMenu.id);
  const closeButton: HTMLButtonElement | null = mobileMenu.querySelector(
    ".mobile-menu__close",
  );
  const setOpen = (isOpen: boolean): void => {
    mobileMenu.classList.toggle("mobile-menu--open", isOpen);
    menuToggle.classList.toggle("menu-toggle--open", isOpen);
    closeButton?.classList.toggle("menu-toggle--open", isOpen);
    mobileMenu.inert = !isOpen;
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) closeButton?.focus();
    else menuToggle.focus();
  };
  const closeAndScrollToTop = (): void => {
    setOpen(false);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openAuthFromMenu = (mode: AuthMode): void => {
    setOpen(false);
    openAuth(mode);
  };
  const handleKeydown = (event: KeyboardEvent): void => {
    if (!mobileMenu.classList.contains("mobile-menu--open")) return;
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable: HTMLElement[] = [
      ...mobileMenu.querySelectorAll<HTMLElement>("a, button"),
    ];
    const first: HTMLElement | undefined = focusable[0];
    const last: HTMLElement | undefined = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
  const closeWhenMenuToggleIsHidden = (): void => {
    const isMenuOpen: boolean =
      mobileMenu.classList.contains("mobile-menu--open");
    const isMenuToggleHidden: boolean =
      getComputedStyle(menuToggle).display === "none";

    if (isMenuOpen && isMenuToggleHidden) setOpen(false);
  };

  menuToggle.addEventListener("click", (): void => {
    setOpen(true);
  });
  closeButton?.addEventListener("click", (): void => {
    setOpen(false);
  });
  for (const link of mobileMenu.querySelectorAll<HTMLAnchorElement>(
    ":scope .mobile-menu__navigation a",
  )) {
    link.addEventListener("click", closeAndScrollToTop);
  }
  mobileMenu
    .querySelector(".mobile-menu__logo")
    ?.addEventListener("click", closeAndScrollToTop);
  mobileMenu
    .querySelector(".mobile-menu__login-button")
    ?.addEventListener("click", (): void => {
      openAuthFromMenu("login");
    });
  mobileMenu
    .querySelector(".mobile-menu__signup-button")
    ?.addEventListener("click", (): void => {
      openAuthFromMenu("register");
    });
  document.addEventListener("keydown", handleKeydown);

  const resizeObserver: ResizeObserver = new ResizeObserver(
    closeWhenMenuToggleIsHidden,
  );
  resizeObserver.observe(menuToggle);
};
