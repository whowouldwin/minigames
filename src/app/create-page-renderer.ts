import { updateNavigationState } from "../components/navigation/create-navigation-list";
import { createHomePage } from "../pages/home";
import { createLibraryPage } from "../pages/library";
import { createNotFoundPage } from "../pages/not-found";
import type { AppPage } from "../types/app-page";
import type { SnackbarController } from "../components/ui/snackbar";
import type { AppRoute, AppRouter } from "../router";

interface PageRendererDependencies {
  router: AppRouter;
  headerElement: HTMLElement;
  snackbar: SnackbarController;
  navigateTo: (page: AppPage) => void;
  openGameDetails: (gameSlug: string) => void;
  synchronizeDialogs: (dialog: AppRoute["dialog"]) => void;
}

interface PageRenderer {
  element: HTMLDivElement;
  render: (route: AppRoute) => void;
}

export const createPageRenderer = ({
  router,
  headerElement,
  snackbar,
  navigateTo,
  openGameDetails,
  synchronizeDialogs,
}: PageRendererDependencies): PageRenderer => {
  const element: HTMLDivElement = document.createElement("div");
  element.className = "app__page";

  let activePage: AppRoute["page"] | undefined;
  let library: ReturnType<typeof createLibraryPage> | undefined;

  const render = (route: AppRoute): void => {
    if (activePage !== route.page) {
      library?.destroy();
      library = undefined;

      if (route.page === "library") {
        library = createLibraryPage(
          openGameDetails,
          snackbar,
          (query): void => {
            router.navigate({ ...router.getRoute(), library: query });
          },
        );
        element.replaceChildren(library.element);
      } else if (route.page === "not-found") {
        element.replaceChildren(
          createNotFoundPage((): void => navigateTo("home")),
        );
      } else {
        element.replaceChildren(
          createHomePage(openGameDetails, navigateTo, snackbar),
        );
      }

      activePage = route.page;
      updateNavigationState(
        headerElement,
        route.page === "not-found" ? undefined : route.page,
      );
    }

    if (route.page === "library") library?.update(route.library);
    synchronizeDialogs(route.dialog);
  };

  return { element, render };
};
