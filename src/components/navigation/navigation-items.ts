import type { AppPage } from "../../types/app-page";

export interface NavigationItem {
  label: string;
  href: string;
  targetPage: AppPage;
  activePage?: AppPage;
}

const pageHrefs: Record<AppPage, string> = {
  home: "./",
  library: "./library",
};

const createNavigationItem = (
  label: string,
  targetPage: AppPage,
  activePage?: AppPage,
): NavigationItem => ({
  label,
  href: pageHrefs[targetPage],
  targetPage,
  ...(activePage && { activePage }),
});

const homeItem: NavigationItem = createNavigationItem("Home", "home", "home");
const libraryItem: NavigationItem = createNavigationItem(
  "Library",
  "library",
  "library",
);
const tournamentsItem: NavigationItem = createNavigationItem(
  "Tournaments",
  "home",
);

export const navigationItems: readonly NavigationItem[] = [
  homeItem,
  libraryItem,
  tournamentsItem,
  createNavigationItem("Community", "home"),
];

export const footerNavigationItems: readonly NavigationItem[] = [
  homeItem,
  libraryItem,
  createNavigationItem("Categories", "home"),
  tournamentsItem,
];
