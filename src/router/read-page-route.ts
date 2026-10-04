import type { PageRoute } from "./route-state";

export const readPageRoute = (
  pathname: string,
  basePath: string,
): PageRoute => {
  const path = pathname.replace(/\/$/, "");
  const homePath = basePath.replace(/\/$/, "");

  if (path === homePath || path === `${basePath}home`) {
    return { page: "home" };
  }

  return path === `${basePath}library`
    ? { page: "library" }
    : { page: "not-found", path: pathname };
};
