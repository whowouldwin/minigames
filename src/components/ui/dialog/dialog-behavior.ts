export const closeDialogWithAnimation = async (
  dialog: HTMLDialogElement,
  closingClassName: string,
): Promise<void> => {
  dialog.classList.add(closingClassName);
  await Promise.allSettled(
    dialog
      .getAnimations()
      .map((animation: Animation): Promise<Animation> => animation.finished),
  );
  dialog.close();
  dialog.classList.remove(closingClassName);
};

export const setupDialogDismissal = (
  dialog: HTMLDialogElement,
  close: () => void,
  canDismiss: () => boolean = (): boolean => true,
): void => {
  dialog.addEventListener("cancel", (event: Event): void => {
    event.preventDefault();
    if (canDismiss()) close();
  });

  let isBackdropDown: boolean = false;
  const isOutsideDialog = (event: MouseEvent): boolean => {
    const bounds: DOMRect = dialog.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  };

  dialog.addEventListener("pointerdown", (event: PointerEvent): void => {
    isBackdropDown = isOutsideDialog(event);
  });
  dialog.addEventListener("click", (event: MouseEvent): void => {
    if (isBackdropDown && isOutsideDialog(event) && canDismiss()) close();
  });
};
