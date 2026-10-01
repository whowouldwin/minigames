import "./snackbar.scss";

export type SnackbarVariant = "success" | "error" | "warning" | "info";

export interface SnackbarController {
  element: HTMLElement;
  show: (message: string, variant?: SnackbarVariant) => void;
}

export const createSnackbar = (): SnackbarController => {
  const host: HTMLElement = document.createElement("div");
  host.className = "snackbar-host";
  host.setAttribute("aria-live", "polite");
  host.setAttribute("aria-atomic", "true");

  const snackbar: HTMLDivElement = document.createElement("div");
  snackbar.className = "snackbar";
  snackbar.hidden = true;

  const message: HTMLParagraphElement = document.createElement("p");
  message.className = "snackbar__message";

  const close: HTMLButtonElement = document.createElement("button");
  close.className = "snackbar__close";
  close.type = "button";
  close.setAttribute("aria-label", "Dismiss notification");
  close.textContent = "×";

  snackbar.append(message, close);
  host.append(snackbar);

  let dismissTimer: number | undefined;

  const dismiss = (): void => {
    snackbar.hidden = true;
    if (dismissTimer === undefined) return;
    globalThis.clearTimeout(dismissTimer);
    dismissTimer = undefined;
  };

  close.addEventListener("click", dismiss);

  return {
    element: host,
    show: (text: string, variant: SnackbarVariant = "info"): void => {
      if (dismissTimer !== undefined) globalThis.clearTimeout(dismissTimer);
      message.textContent = text;
      snackbar.className = `snackbar snackbar--${variant}`;
      snackbar.hidden = false;
      dismissTimer = globalThis.setTimeout(dismiss, 5000);
    },
  };
};
