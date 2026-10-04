const MINUTE: number = 60 * 1000;
const HOUR: number = 60 * MINUTE;
const DAY: number = 24 * HOUR;
const WEEK: number = 7 * DAY;
const FOUR_WEEKS: number = 4 * WEEK;
const YEAR: number = 365 * DAY;

const formatCount = (
  count: number,
  singularUnit: string,
  pluralUnit: string = `${singularUnit}s`,
): string => `${count} ${count === 1 ? singularUnit : pluralUnit} ago`;

const getDateAfterMonths = (date: Date, months: number): Date => {
  const result: Date = new Date(date);
  const dayOfMonth: number = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDayOfMonth: number = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth));

  return result;
};

const getCalendarMonthsAgo = (date: Date, now: Date): number => {
  const monthDifference: number =
    (now.getUTCFullYear() - date.getUTCFullYear()) * 12 +
    now.getUTCMonth() -
    date.getUTCMonth();

  return getDateAfterMonths(date, monthDifference).getTime() > now.getTime()
    ? monthDifference - 1
    : monthDifference;
};

const getCalendarYearsAgo = (date: Date, now: Date): number => {
  const yearDifference: number = now.getUTCFullYear() - date.getUTCFullYear();
  const yearAnniversary: Date = getDateAfterMonths(date, yearDifference * 12);

  return yearAnniversary.getTime() > now.getTime()
    ? yearDifference - 1
    : yearDifference;
};

export const formatCommentRelativeTime = (
  createdAt: string,
  now: Date = new Date(),
): string => {
  const createdAtDate: Date = new Date(createdAt);

  if (Number.isNaN(createdAtDate.getTime())) return "Unknown time";

  const elapsed: number = Math.max(0, now.getTime() - createdAtDate.getTime());

  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} min ago`;
  }
  if (elapsed < DAY) return formatCount(Math.floor(elapsed / HOUR), "hour");
  if (elapsed < WEEK) return formatCount(Math.floor(elapsed / DAY), "day");
  if (elapsed < FOUR_WEEKS) {
    return formatCount(Math.floor(elapsed / WEEK), "week");
  }
  if (elapsed < YEAR) {
    const monthsAgo: number = getCalendarMonthsAgo(createdAtDate, now);
    return formatCount(Math.max(monthsAgo, 1), "month");
  }

  const yearsAgo: number = getCalendarYearsAgo(createdAtDate, now);
  return formatCount(Math.max(yearsAgo, 1), "year");
};
