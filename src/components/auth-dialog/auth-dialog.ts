import { createAuthForm } from "./auth-form";
import { closeDialogWithAnimation, setupDialogDismissal } from "../ui/dialog";
import type { AuthMode } from "./auth-form";
import "./auth-dialog.scss";

export interface AuthDialog {
  element: HTMLDialogElement;
  open: (mode: AuthMode) => void;
  close: () => Promise<void>;
}

interface AuthDialogCallbacks {
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

export const createAuthDialog = ({
  onClose,
  onModeChange,
}: AuthDialogCallbacks): AuthDialog => {
  const dialog: HTMLDialogElement = document.createElement("dialog");
  dialog.className = "auth-dialog";
  dialog.setAttribute("aria-labelledby", "auth-title");
  const tabs: HTMLDivElement = document.createElement("div");
  tabs.className = "auth-dialog__tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Account access");
  const panel: HTMLDivElement = document.createElement("div");
  panel.className = "auth-dialog__panel";
  panel.id = "auth-panel";
  panel.setAttribute("role", "tabpanel");
  let activeMode: AuthMode = "login";
  let isClosing: boolean = false;
  let trigger: HTMLElement | undefined;

  const setMode = (mode: AuthMode): void => {
    activeMode = mode;
    for (const tab of tabs.querySelectorAll<HTMLButtonElement>("button")) {
      const isSelected: boolean = tab.dataset.mode === mode;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    }
    panel.setAttribute("aria-labelledby", `auth-tab-${mode}`);
    panel.replaceChildren(createAuthForm(mode, onModeChange));
    if (!globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 200, easing: "ease-out" },
      );
    }
  };
  for (const mode of ["login", "register"] as const) {
    const tab: HTMLButtonElement = document.createElement("button");
    tab.type = "button";
    tab.id = `auth-tab-${mode}`;
    tab.dataset.mode = mode;
    tab.textContent = mode === "login" ? "Login" : "Register";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    tab.addEventListener("click", (): void => {
      if (activeMode !== mode) onModeChange(mode);
    });
    tab.addEventListener("keydown", (event: KeyboardEvent): void => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      let next: AuthMode = activeMode === "login" ? "register" : "login";
      if (event.key === "Home") next = "login";
      else if (event.key === "End") next = "register";
      onModeChange(next);
      tabs
        .querySelector<HTMLButtonElement>(`[data-mode="${CSS.escape(next)}"]`)
        ?.focus();
    });
    tabs.append(tab);
  }
  const close = async (): Promise<void> => {
    if (isClosing || !dialog.open) return;
    isClosing = true;
    await closeDialogWithAnimation(dialog, "auth-dialog--closing");
    isClosing = false;
    trigger?.focus();
  };
  setupDialogDismissal(dialog, onClose);
  dialog.append(tabs, panel);
  setMode("login");
  return {
    element: dialog,
    close,
    open: (mode: AuthMode): void => {
      if (isClosing || (activeMode === mode && dialog.open)) return;
      if (!dialog.open) {
        trigger =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : undefined;
      }
      setMode(mode);
      if (!dialog.open) dialog.showModal();
    },
  };
};
