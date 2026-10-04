import type { DialogRoute } from "./route-state";

export const readDialogRoute = (
  search: URLSearchParams,
): DialogRoute | undefined => {
  const gameSlug = search.get("game");
  if (gameSlug) return { kind: "game", gameSlug };

  const mode = search.get("auth");
  return mode === "login" || mode === "register"
    ? { kind: "auth", mode }
    : undefined;
};
