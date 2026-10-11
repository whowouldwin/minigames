import type { LeaderboardPlayer } from "../../api";
import { formatCompactCount } from "../../utils/format-compact-count";
import { getInitials } from "../../utils/get-initials";

const COLUMN_COUNT = 6;
const scoreFormatter = new Intl.NumberFormat("en-US");

const createCell = (text: string, className?: string): HTMLTableCellElement => {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
};

const createSpan = (className: string, text: string): HTMLSpanElement => {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
};

const createPlayerCell = (player: LeaderboardPlayer): HTMLTableCellElement => {
  const avatar = createSpan(
    `leaderboard__avatar leaderboard__avatar--${player.rank}`,
    getInitials(player.playerName),
  );
  avatar.setAttribute("aria-hidden", "true");

  const playerElement = document.createElement("span");
  playerElement.className = "leaderboard__player";
  playerElement.append(
    avatar,
    createSpan("leaderboard__name", player.playerName),
  );

  const cell = document.createElement("td");
  cell.append(playerElement);
  return cell;
};

const createScoreCell = (score: number): HTMLTableCellElement => {
  const cell = document.createElement("td");
  const scores = [
    ["leaderboard__full-score", scoreFormatter.format(score)],
    ["leaderboard__compact-score", formatCompactCount(score)],
  ];

  for (const [className, value] of scores) {
    cell.append(createSpan(className, value));
  }

  return cell;
};

export const createPlayerRow = (
  player: LeaderboardPlayer,
): HTMLTableRowElement => {
  const favorite = document.createElement("td");
  favorite.className = "leaderboard__favorite";
  favorite.append(createSpan("leaderboard__badge", player.favoriteGameName));

  const row = document.createElement("tr");
  row.append(
    createCell(`#${player.rank}`, "leaderboard__rank"),
    createPlayerCell(player),
    createCell(String(player.gamesPlayed), "leaderboard__games"),
    createScoreCell(player.totalScore),
    createCell(`🔥 ${player.streakDays}`, "leaderboard__streak"),
    favorite,
  );
  return row;
};

export const createStateRow = (content: HTMLElement): HTMLTableRowElement => {
  const cell = document.createElement("td");
  cell.colSpan = COLUMN_COUNT;
  cell.append(content);

  const row = document.createElement("tr");
  row.className = "leaderboard__state-row";
  row.append(cell);
  return row;
};
