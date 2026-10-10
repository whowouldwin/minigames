import type { GameDetails } from "../../api";
import { createGameDetailsTopRecords } from "./game-details-top-records";
import {
  createGameDetailsViewActions,
  type GameDetailsViewOptions,
} from "./game-details-view-actions";
import {
  createGameDetailsDescription,
  createGameDetailsInfo,
} from "./game-details-view-info";
import { createGameDetailsViewHeader } from "./game-details-view-header";

export const createGameDetailsView = (
  game: GameDetails,
  comments: HTMLElement,
  options: GameDetailsViewOptions,
): DocumentFragment => {
  const header = createGameDetailsViewHeader(game);
  const view: DocumentFragment = document.createDocumentFragment();

  view.append(
    header.element,
    createGameDetailsDescription(game.fullDescription),
    createGameDetailsInfo(game.specs),
    createGameDetailsViewActions(game, header.likesCount, options),
    createGameDetailsTopRecords(game.topRecords),
    comments,
  );

  return view;
};
