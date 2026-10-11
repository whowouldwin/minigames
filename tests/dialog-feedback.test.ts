import { describe, expect, it, vi } from "vitest";
import { setupDialogDismissal } from "../src/components/ui/dialog/dialog-behavior";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../src/components/ui/request-feedback/request-feedback";
import { createSnackbar } from "../src/components/ui/snackbar/snackbar";

describe("dialog and request feedback behavior", () => {
  it("dismisses dialogs on Escape and backdrop clicks only when allowed", () => {
    const dialog = document.createElement("dialog");
    const close = vi.fn();
    let isAllowed = false;
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({
      left: 10,
      right: 100,
      top: 10,
      bottom: 100,
    } as DOMRect);
    setupDialogDismissal(dialog, close, () => isAllowed);

    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    dialog.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 0, clientY: 0 }),
    );
    dialog.dispatchEvent(new MouseEvent("click", { clientX: 0, clientY: 0 }));
    expect(cancel.defaultPrevented).toBe(true);
    expect(close).not.toHaveBeenCalled();

    isAllowed = true;
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    dialog.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 0, clientY: 0 }),
    );
    dialog.dispatchEvent(new MouseEvent("click", { clientX: 0, clientY: 0 }));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it("exposes loading, empty, and retryable error states accessibly", () => {
    const skeleton = createRequestSkeleton("Loading games", "cards", 3);
    const empty = createEmptyState("No games found.");
    const retry = vi.fn();
    const error = createErrorState("Could not load games.", retry);

    expect(skeleton.getAttribute("aria-busy")).toBe("true");
    expect(skeleton.children).toHaveLength(3);
    expect(empty.textContent).toContain("No games found.");
    error.querySelector("button")!.click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it("replaces a snackbar message and dismisses it when closed", () => {
    vi.useFakeTimers();
    const snackbar = createSnackbar();
    snackbar.show("Saved", "success");
    snackbar.show("Try again", "error");
    expect(snackbar.element.textContent).toContain("Try again");
    expect(snackbar.element.querySelector(".snackbar")?.className).toContain(
      "snackbar--error",
    );
    snackbar.element
      .querySelector<HTMLButtonElement>(".snackbar__close")!
      .click();
    expect(
      snackbar.element.querySelector(".snackbar")?.hasAttribute("hidden"),
    ).toBe(true);
    vi.useRealTimers();
  });
});
