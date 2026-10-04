import type { AuthDialog } from "../components/auth-dialog/auth-dialog";
import type { GameDetailsDialog } from "../components/game-details-dialog/game-details-dialog";
import type { DialogRoute } from "../router";

export const createDialogRouteSync = (
  auth: AuthDialog,
  gameDetails: GameDetailsDialog,
): ((dialog: DialogRoute | undefined) => void) => {
  let latestUpdate: number = 0;
  let pendingUpdate: Promise<void> = Promise.resolve();

  const synchronize = async (
    dialog: DialogRoute | undefined,
    currentUpdate: number,
    previousUpdate: Promise<void>,
  ): Promise<void> => {
    await previousUpdate;
    if (currentUpdate !== latestUpdate) return;

    if (dialog?.kind !== "auth") await auth.close();
    if (dialog?.kind !== "game") await gameDetails.close();
    if (currentUpdate !== latestUpdate) return;

    if (dialog?.kind === "auth") {
      auth.open(dialog.mode);
    } else if (dialog?.kind === "game") {
      gameDetails.open(dialog.gameSlug);
    }
  };

  return (dialog): void => {
    latestUpdate += 1;
    pendingUpdate = synchronize(dialog, latestUpdate, pendingUpdate);
  };
};
