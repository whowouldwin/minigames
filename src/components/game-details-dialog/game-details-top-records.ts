import "./game-details-top-records.scss";

interface GameRecord {
  medal: string;
  player: string;
  score: string;
  date: string;
}

const topRecords: GameRecord[] = [
  {
    medal: "🥇",
    player: "ForestSpirit",
    score: "356,700 pts",
    date: "2 days ago",
  },
  {
    medal: "🥈",
    player: "TeaBrewer",
    score: "332,400pts",
    date: "5 days ago",
  },
  {
    medal: "🥉",
    player: "HerbalistPath",
    score: "308,900 pts",
    date: "1 week ago",
  },
];

const createRecordRow = ({
  medal,
  player,
  score,
  date,
}: GameRecord): HTMLLIElement => {
  const row: HTMLLIElement = document.createElement("li");
  row.className = "game-details-records__row";

  const playerInfo: HTMLDivElement = document.createElement("div");
  playerInfo.className = "game-details-records__player";

  const medalIcon: HTMLSpanElement = document.createElement("span");
  medalIcon.className = "game-details-records__medal";
  medalIcon.setAttribute("aria-hidden", "true");
  medalIcon.textContent = medal;

  const playerName: HTMLSpanElement = document.createElement("span");
  playerName.className = "game-details-records__player-name";
  playerName.textContent = player;
  playerInfo.append(medalIcon, playerName);

  const scoreLabel: HTMLSpanElement = document.createElement("span");
  scoreLabel.className = "game-details-records__score";
  scoreLabel.textContent = score;

  const dateLabel: HTMLTimeElement = document.createElement("time");
  dateLabel.className = "game-details-records__date";
  dateLabel.textContent = date;

  row.append(playerInfo, scoreLabel, dateLabel);

  return row;
};

export const createGameDetailsTopRecords = (): HTMLElement => {
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

  for (const record of topRecords) {
    recordList.append(createRecordRow(record));
  }

  section.append(heading, recordList);

  return section;
};
