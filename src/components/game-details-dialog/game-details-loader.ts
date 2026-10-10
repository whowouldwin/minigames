import { ApiError, getErrorMessage, getGameDetails } from "../../api";
import type { GameDetailsContent } from "./game-details-content";
import { createLatestRequest } from "../../utils/latest-request";
import type { SnackbarController } from "../ui/snackbar";

interface GameDetailsLoaderOptions {
  content: Pick<
    GameDetailsContent,
    "showLoading" | "showError" | "showNotFound" | "renderGame"
  >;
  snackbar: SnackbarController;
  isDialogOpen: () => boolean;
}

interface GameDetailsLoader {
  load: (gameSlug: string) => Promise<void>;
  cancel: () => void;
}

export const createGameDetailsLoader = ({
  content,
  snackbar,
  isDialogOpen,
}: GameDetailsLoaderOptions): GameDetailsLoader => {
  const request = createLatestRequest(isDialogOpen);

  const load = async (gameSlug: string): Promise<void> => {
    if (!isDialogOpen()) return;

    const controller = request.start();
    content.showLoading();

    try {
      const response = await getGameDetails(gameSlug, {
        signal: controller.signal,
      });
      if (!request.isCurrent(controller)) return;

      if (!response.data) {
        content.showNotFound();
        return;
      }

      content.renderGame(response.data);
    } catch (error) {
      if (!request.isCurrent(controller)) return;

      if (error instanceof ApiError && error.status === 404) {
        content.showNotFound();
        return;
      }

      const message = getErrorMessage(error, "Unable to load game details.");
      content.showError(message, (): void => {
        void load(gameSlug);
      });
      snackbar.show(message, "error");
    } finally {
      request.finish(controller);
    }
  };

  return { load, cancel: request.cancel };
};
