import type { GameDetailsRecord } from "../../api";

import { createEmptyState } from "../ui/request-feedback";
import "./game-details-top-records.scss";

const getMedal = (position: number): string => {
  switch (position) {
    case 1: {
      return "🥇";
    }
    case 2: {
      return "🥈";
    }
    case 3: {
      return "🥉";
    }
    default: {
      return String(position);
    }
  }
};

const createRecordRow = ({
  position,
  playerName: recordPlayerName,
  score,
  achievedAt,
}: GameDetailsRecord): HTMLLIElement => {
  const row: HTMLLIElement = document.createElement("li");
  row.className = "game-details-records__row";

  const playerInfo: HTMLDivElement = document.createElement("div");
  playerInfo.className = "game-details-records__player";

  const medalIcon: HTMLSpanElement = document.createElement("span");
  medalIcon.className = "game-details-records__medal";
  medalIcon.setAttribute("aria-hidden", "true");
  medalIcon.textContent = getMedal(position);

  const playerName: HTMLSpanElement = document.createElement("span");
  playerName.className = "game-details-records__player-name";
  playerName.textContent = recordPlayerName;
  playerInfo.append(medalIcon, playerName);

  const scoreLabel: HTMLSpanElement = document.createElement("span");
  scoreLabel.className = "game-details-records__score";
  scoreLabel.textContent = `${score.toLocaleString("en-US")} pts`;

  const dateLabel: HTMLTimeElement = document.createElement("time");
  dateLabel.className = "game-details-records__date";
  dateLabel.dateTime = achievedAt;
  dateLabel.textContent = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(achievedAt));

  row.append(playerInfo, scoreLabel, dateLabel);

  return row;
};

export const createGameDetailsTopRecords = (
  records: GameDetailsRecord[],
): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
  section.className = "game-details-records";
  section.setAttribute("aria-labelledby", "game-details-records-title");

  const heading: HTMLHeadingElement = document.createElement("h3");
  heading.className = "game-details-records__title";
  heading.id = "game-details-records-title";

  const trophyIcon: HTMLSpanElement = document.createElement("span");
  trophyIcon.className = "game-details-records__trophy";
  trophyIcon.setAttribute("aria-hidden", "true");
  trophyIcon.textContent = "🏆";

  const title: HTMLSpanElement = document.createElement("span");
  title.textContent = "Top Records";
  heading.append(trophyIcon, title);

  const recordList: HTMLOListElement = document.createElement("ol");
  recordList.className = "game-details-records__list";

  if (records.length === 0) {
    const emptyRow: HTMLLIElement = document.createElement("li");
    emptyRow.className = "game-details-records__empty";
    emptyRow.append(createEmptyState("No top records are available yet."));
    recordList.append(emptyRow);
  } else {
    for (const record of records) {
      recordList.append(createRecordRow(record));
    }
  }

  section.append(heading, recordList);

  return section;
};
