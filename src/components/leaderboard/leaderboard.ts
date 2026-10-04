import { getErrorMessage, getLeaderboard } from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import type { SnackbarController } from "../ui/snackbar";
import { createPlayerRow, createStateRow } from "./leaderboard-rows";
import "./leaderboard.scss";

export const createLeaderboard = (
  snackbar: SnackbarController,
): HTMLElement => {
  const section = document.createElement("section");
  section.className = "leaderboard";
  section.setAttribute("aria-labelledby", "leaderboard-title");
  section.innerHTML = `
    <h2 id="leaderboard-title" class="leaderboard__title">Top Players<span class="leaderboard__title-extra"> This Week</span></h2>
    <div class="leaderboard__frame">
      <table class="leaderboard__table" aria-labelledby="leaderboard-title">
        <thead><tr>
          <th scope="col">Rank</th><th scope="col">Player</th>
          <th scope="col" class="leaderboard__games">Games<span class="leaderboard__desktop"> Played</span></th>
          <th scope="col"><span class="leaderboard__desktop">Total </span>Score</th>
          <th scope="col">Streak</th><th scope="col" class="leaderboard__favorite">Favorite Game</th>
        </tr></thead><tbody></tbody>
      </table>
    </div>`;

  const body = section.querySelector("tbody");
  if (!body) return section;

  const showState = (content: HTMLElement): void => {
    body.replaceChildren(createStateRow(content));
  };

  const loadPlayers = async (): Promise<void> => {
    showState(createRequestSkeleton("Loading leaderboard", "table", 5));

    try {
      const response = await getLeaderboard();
      if (!section.isConnected) return;

      if (response.data.length === 0) {
        showState(
          createEmptyState("No leaderboard players are available yet."),
        );
        return;
      }

      body.replaceChildren();
      for (const player of response.data) {
        body.append(createPlayerRow(player));
      }
    } catch (error) {
      if (!section.isConnected) return;

      const message = getErrorMessage(
        error,
        "The leaderboard could not be loaded.",
      );
      snackbar.show("The leaderboard could not be loaded.", "error");
      showState(createErrorState(message, () => void loadPlayers()));
    }
  };

  void loadPlayers();
  return section;
};
