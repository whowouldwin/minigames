export interface LatestRequest {
  start: () => AbortController;
  isCurrent: (controller: AbortController) => boolean;
  finish: (controller: AbortController) => void;
  cancel: () => void;
}

export const createLatestRequest = (isActive: () => boolean): LatestRequest => {
  let activeController: AbortController | undefined;

  const cancel = (): void => {
    activeController?.abort();
    activeController = undefined;
  };

  return {
    start: (): AbortController => {
      cancel();
      activeController = new AbortController();
      return activeController;
    },
    isCurrent: (controller): boolean =>
      activeController === controller &&
      !controller.signal.aborted &&
      isActive(),
    finish: (controller): void => {
      if (activeController === controller) activeController = undefined;
    },
    cancel,
  };
};
