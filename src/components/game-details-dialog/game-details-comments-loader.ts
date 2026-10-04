import { getErrorMessage, getGameComments } from "../../api";
import type { SnackbarController } from "../ui/snackbar";
import type { GameDetailsComments } from "./game-details-comments";

interface GameDetailsCommentsLoaderOptions {
  comments: GameDetailsComments;
  snackbar: SnackbarController;
  isDialogOpen: () => boolean;
}

interface GameDetailsCommentsLoader {
  load: (gameSlug: string) => Promise<void>;
  cancel: () => void;
}

export const createGameDetailsCommentsLoader = ({
  comments,
  snackbar,
  isDialogOpen,
}: GameDetailsCommentsLoaderOptions): GameDetailsCommentsLoader => {
  let requestController: AbortController | undefined;
  let requestId: number = 0;

  const cancel = (): void => {
    requestController?.abort();
    requestController = undefined;
    requestId += 1;
  };

  const load = async (gameSlug: string): Promise<void> => {
    if (!isDialogOpen()) return;

    cancel();
    const currentRequestId: number = requestId;
    const controller = new AbortController();
    requestController = controller;
    comments.showLoading();

    const isCurrentRequest = (): boolean =>
      requestController === controller &&
      !controller.signal.aborted &&
      requestId === currentRequestId &&
      isDialogOpen();

    try {
      const response = await getGameComments(gameSlug, controller.signal);
      if (!isCurrentRequest()) return;

      const totalComments: number | undefined = response.meta?.totalComments;
      if (typeof totalComments !== "number" || !Array.isArray(response.data)) {
        throw new TypeError(
          "The game server returned an invalid comments response.",
        );
      }

      comments.render(response.data, totalComments);
    } catch (error) {
      if (!isCurrentRequest()) return;

      const message: string = getErrorMessage(
        error,
        "Unable to load comments.",
      );
      comments.showError(message, (): void => {
        void load(gameSlug);
      });
      snackbar.show(message, "error");
    } finally {
      if (requestController === controller) requestController = undefined;
    }
  };

  return { load, cancel };
};
