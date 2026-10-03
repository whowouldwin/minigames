import { getErrorMessage, getLeaderboard } from "../../api";
import type { LeaderboardPlayer } from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import "./leaderboard.scss";

const createCell = (text: string): HTMLTableCellElement => {
  const cell: HTMLTableCellElement = document.createElement("td");
  cell.textContent = text;
  return cell;
};

const getInitials = (name: string): string => {
  const parts = name.split(/[\s_-]+/).filter(Boolean);
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : (parts[0] ?? "?").slice(0, 2).toUpperCase();
};

const createPlayerCell = (player: LeaderboardPlayer): HTMLTableCellElement => {
  const cell: HTMLTableCellElement = document.createElement("td");
  const playerElement: HTMLSpanElement = document.createElement("span");
  playerElement.className = "leaderboard__player";

  const avatar: HTMLSpanElement = document.createElement("span");
  avatar.className = `leaderboard__avatar leaderboard__avatar--${player.rank}`;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = getInitials(player.playerName);

  const name: HTMLSpanElement = document.createElement("span");
  name.className = "leaderboard__name";
  name.textContent = player.playerName;
  playerElement.append(avatar, name);
  cell.append(playerElement);

  return cell;
};

const createScoreCell = (score: number): HTMLTableCellElement => {
  const cell: HTMLTableCellElement = document.createElement("td");
  const fullScore: HTMLSpanElement = document.createElement("span");
  fullScore.className = "leaderboard__full-score";
  fullScore.textContent = score.toLocaleString("en-US");

  const compactScore: HTMLSpanElement = document.createElement("span");
  compactScore.className = "leaderboard__compact-score";
  compactScore.textContent = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(score);
  cell.append(fullScore, compactScore);

  return cell;
};

const createPlayerRow = (player: LeaderboardPlayer): HTMLTableRowElement => {
  const row: HTMLTableRowElement = document.createElement("tr");
  const rank: HTMLTableCellElement = createCell(`#${player.rank}`);
  rank.classList.add("leaderboard__rank");

  const games: HTMLTableCellElement = createCell(String(player.gamesPlayed));
  games.classList.add("leaderboard__games");

  const streak: HTMLTableCellElement = createCell(`🔥 ${player.streakDays}`);
  streak.classList.add("leaderboard__streak");

  const favorite: HTMLTableCellElement = createCell(player.favoriteGameName);
  favorite.classList.add("leaderboard__favorite");
  const badge: HTMLSpanElement = document.createElement("span");
  badge.className = "leaderboard__badge";
  badge.textContent = player.favoriteGameName;
  favorite.replaceChildren(badge);

  row.append(
    rank,
    createPlayerCell(player),
    games,
    createScoreCell(player.totalScore),
    streak,
    favorite,
  );
  return row;
};

const createStateRow = (content: HTMLElement): HTMLTableRowElement => {
  const row: HTMLTableRowElement = document.createElement("tr");
  row.className = "leaderboard__state-row";

  const cell: HTMLTableCellElement = document.createElement("td");
  cell.colSpan = 6;
  cell.append(content);
  row.append(cell);

  return row;
};

export const createLeaderboard = (): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
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

  const body: HTMLTableSectionElement | null = section.querySelector("tbody");
  if (!body) return section;

  const loadPlayers = async (): Promise<void> => {
    body.replaceChildren(
      createStateRow(createRequestSkeleton("Loading leaderboard", "table", 5)),
    );

    try {
      const response = await getLeaderboard();
      if (!section.isConnected) return;

      if (response.data.length === 0) {
        body.replaceChildren(
          createStateRow(
            createEmptyState("No leaderboard players are available yet."),
          ),
        );
        return;
      }

      body.replaceChildren(
        ...response.data.map((player: LeaderboardPlayer) =>
          createPlayerRow(player),
        ),
      );
    } catch (error) {
      if (!section.isConnected) return;

      const message = getErrorMessage(
        error,
        "The leaderboard could not be loaded.",
      );
      body.replaceChildren(
        createStateRow(
          createErrorState(message, (): void => {
            void loadPlayers();
          }),
        ),
      );
    }
  };

  void loadPlayers();
  return section;
};
