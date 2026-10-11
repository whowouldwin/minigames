import { describe, expect, it } from "vitest";
import { formatCompactCount } from "../src/utils/format-compact-count";
import { getInitials } from "../src/utils/get-initials";
import { getProfileInitials } from "../src/utils/get-profile-initials";
import { createLatestRequest } from "../src/utils/latest-request";
import { getVisiblePageWindow } from "../src/components/library-pagination/pagination-page-window";
import { formatCommentRelativeTime } from "../src/components/game-details-dialog/game-details-comments/comment-relative-time";
import { createCommentAvatarColorPicker } from "../src/components/game-details-dialog/game-details-comments/comment-avatar";

describe("shared formatting and request utilities", () => {
  it("formats names into initials without losing Unicode letters", () => {
    expect(getInitials(" cozy-gamer ")).toBe("CG");
    expect(getInitials("Lera")).toBe("LE");
    expect(getInitials("  ")).toBe("?");
    expect(getProfileInitials("  Éclair 星  extra ")).toBe("É星");
    expect(getProfileInitials("---")).toBeUndefined();
  });

  it("formats large counts compactly and leaves small counts readable", () => {
    expect(formatCompactCount(999)).toBe("999");
    expect(formatCompactCount(1500)).toBe("1.5K");
  });

  it("cancels stale requests and reports only the active request as current", () => {
    let isActive = true;
    const requests = createLatestRequest(() => isActive);
    const first = requests.start();
    const second = requests.start();

    expect(first.signal.aborted).toBe(true);
    expect(requests.isCurrent(first)).toBe(false);
    expect(requests.isCurrent(second)).toBe(true);

    isActive = false;
    expect(requests.isCurrent(second)).toBe(false);
    requests.finish(first);
    expect(requests.isCurrent(second)).toBe(false);
    requests.cancel();
    expect(second.signal.aborted).toBe(true);
  });
});

describe("library and comment formatting", () => {
  it("keeps the visible pagination window within available pages", () => {
    expect(getVisiblePageWindow(5, 9, 5)).toEqual({
      firstPage: 3,
      lastPage: 7,
    });
    expect(getVisiblePageWindow(1, 3, 5)).toEqual({
      firstPage: 1,
      lastPage: 3,
    });
  });

  it("formats relative timestamps across time ranges and invalid values", () => {
    const now = new Date("2026-10-11T12:00:00.000Z");
    expect(formatCommentRelativeTime("invalid", now)).toBe("Unknown time");
    expect(formatCommentRelativeTime("2026-10-11T11:59:30.000Z", now)).toBe(
      "just now",
    );
    expect(formatCommentRelativeTime("2026-10-11T11:00:00.000Z", now)).toBe(
      "1 hour ago",
    );
    expect(formatCommentRelativeTime("2026-10-08T12:00:00.000Z", now)).toBe(
      "3 days ago",
    );
    expect(formatCommentRelativeTime("2026-09-01T12:00:00.000Z", now)).toBe(
      "1 month ago",
    );
    expect(formatCommentRelativeTime("2024-10-11T12:00:00.000Z", now)).toBe(
      "2 years ago",
    );
  });

  it("assigns stable avatar colors for repeated author names", () => {
    const chooseColor = createCommentAvatarColorPicker();
    const firstColor = chooseColor(" Lera ");

    expect(firstColor).toBeGreaterThanOrEqual(1);
    expect(firstColor).toBeLessThanOrEqual(5);
    expect(chooseColor("lera")).toBe(firstColor);
  });
});
