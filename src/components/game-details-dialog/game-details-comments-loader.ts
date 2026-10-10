import { getErrorMessage, getGameComments } from "../../api";
import { createLatestRequest } from "../../utils/latest-request";
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
  const request = createLatestRequest(isDialogOpen);

  const load = async (gameSlug: string): Promise<void> => {
    if (!isDialogOpen()) return;

    const controller = request.start();
    comments.showLoading();

    try {
      const response = await getGameComments(gameSlug, controller.signal);
      if (!request.isCurrent(controller)) return;

      const totalComments: number | undefined = response.meta?.totalComments;
      if (typeof totalComments !== "number" || !Array.isArray(response.data)) {
        throw new TypeError(
          "The game server returned an invalid comments response.",
        );
      }

      comments.render(response.data, totalComments);
    } catch (error) {
      if (!request.isCurrent(controller)) return;

      const message: string = getErrorMessage(
        error,
        "Unable to load comments.",
      );
      comments.showError(message, (): void => {
        void load(gameSlug);
      });
      snackbar.show(message, "error");
    } finally {
      request.finish(controller);
    }
  };

  return { load, cancel: request.cancel };
};
