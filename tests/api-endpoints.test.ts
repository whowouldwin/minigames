import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestApi } = vi.hoisted(() => ({ requestApi: vi.fn() }));

vi.mock("../src/api/client", () => ({ requestApi }));

import {
  getFeaturedGames,
  getLibraryCategories,
  getLibraryGames,
} from "../src/api/game-catalog";
import {
  createGameComment,
  getGameComments,
  toggleCommentLike,
} from "../src/api/game-comments";
import { getGameDetails } from "../src/api/game-details";
import { toggleGameFavorite } from "../src/api/game-favorites";
import { getLeaderboard } from "../src/api/leaderboard";

describe("game API endpoints", () => {
  beforeEach(() => {
    requestApi.mockReset();
    requestApi.mockResolvedValue({ data: [] });
  });

  it("requests featured games and categories with abort signals", () => {
    const signal = new AbortController().signal;

    getFeaturedGames(signal);
    getLibraryCategories(signal);
    getLeaderboard(signal);

    expect(requestApi.mock.calls).toEqual([
      ["games?featured=true", { signal }],
      ["categories", { signal }],
      ["leaderboard", { signal }],
    ]);
  });

  it("builds the default and selected library query parameters", () => {
    getLibraryGames();
    getLibraryGames({ category: "puzzle", sort: "name-asc", page: 4 });

    expect(requestApi.mock.calls).toEqual([
      [
        "games?page=1&category=all&sort=rating-desc&limit=6",
        { signal: undefined },
      ],
      [
        "games?page=4&category=puzzle&sort=name-asc&limit=6",
        { signal: undefined },
      ],
    ]);
  });

  it("encodes game slugs and includes only a provided user email", () => {
    getGameDetails("cozy game");
    getGameDetails("cozy game", { userEmail: "lera+test@example.com" });
    getGameComments("cozy game");
    getGameComments("cozy game", { userEmail: "lera+test@example.com" });

    expect(requestApi.mock.calls).toEqual([
      ["games/cozy%20game", { signal: undefined }],
      [
        "games/cozy%20game?userEmail=lera%2Btest%40example.com",
        { signal: undefined },
      ],
      ["games/cozy%20game/comments?limit=3&sort=newest", { signal: undefined }],
      [
        "games/cozy%20game/comments?limit=3&sort=newest&userEmail=lera%2Btest%40example.com",
        { signal: undefined },
      ],
    ]);
  });

  it("sends comment creation and like mutations with their user payloads", () => {
    const comment = {
      userEmail: "lera@example.com",
      authorName: "Lera",
      text: "Nice game",
    };

    createGameComment("cozy game", comment);
    toggleCommentLike("comment/1", "lera@example.com");
    toggleGameFavorite("cozy game", "lera@example.com");

    expect(requestApi.mock.calls).toEqual([
      ["games/cozy%20game/comments", { method: "POST", body: comment }],
      [
        "comments/comment%2F1/like",
        { method: "POST", body: { userEmail: "lera@example.com" } },
      ],
      [
        "games/cozy%20game/favorite",
        { method: "POST", body: { userEmail: "lera@example.com" } },
      ],
    ]);
  });
});
