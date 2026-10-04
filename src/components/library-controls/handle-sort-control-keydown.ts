export const handleSortControlKeydown = (
  event: KeyboardEvent,
  options: HTMLButtonElement[],
  closeListbox: () => void,
  trigger: HTMLButtonElement,
): void => {
  if (event.key === "Escape") {
    closeListbox();
    trigger.focus();
    return;
  }

  const currentIndex: number = options.indexOf(
    document.activeElement as HTMLButtonElement,
  );
  let nextIndex: number;

  switch (event.key) {
    case "ArrowDown": {
      nextIndex = Math.min(currentIndex + 1, options.length - 1);
      break;
    }
    case "ArrowUp": {
      nextIndex = Math.max(currentIndex - 1, 0);
      break;
    }
    case "Home": {
      nextIndex = 0;
      break;
    }
    case "End": {
      nextIndex = options.length - 1;
      break;
    }
    default: {
      return;
    }
  }

  event.preventDefault();
  options[nextIndex]?.focus();
};
