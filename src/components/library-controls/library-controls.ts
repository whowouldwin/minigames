import "./library-controls.scss";
import {
  DEFAULT_LIBRARY_GAMES_QUERY,
  getErrorMessage,
  getLibraryCategories,
} from "../../api";
import type {
  GameCategorySlug,
  GameSortValue,
  LibraryGamesQuery,
} from "../../api";
import { createLatestRequest } from "../../utils/latest-request";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import type { SnackbarController } from "../ui/snackbar";
import { createFilterChips } from "./create-filter-chips";
import { createSortControl } from "./create-sort-control";

export interface LibraryControlsCallbacks {
  onFilterChange: (category: GameCategorySlug) => void;
  onSortChange: (sort: GameSortValue) => void;
}

interface LibraryControls {
  element: HTMLElement;
  update: (query: LibraryGamesQuery) => void;
  destroy: () => void;
}

export const createLibraryControls = (
  callbacks: LibraryControlsCallbacks,
  snackbar: SnackbarController,
): LibraryControls => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-controls";
  section.setAttribute("aria-label", "Filter and sort games");

  const filters: HTMLDivElement = document.createElement("div");
  filters.className = "library-controls__filters";
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "Filter games by category");

  let currentQuery: LibraryGamesQuery = DEFAULT_LIBRARY_GAMES_QUERY;
  let chips: ReturnType<typeof createFilterChips> | undefined;
  const request = createLatestRequest((): boolean => section.isConnected);
  const sortControl = createSortControl(callbacks.onSortChange);

  const loadCategories = async (): Promise<void> => {
    const controller = request.start();
    filters.replaceChildren(
      createRequestSkeleton("Loading game categories", "chips", 7),
    );

    try {
      const response = await getLibraryCategories(controller.signal);
      if (!request.isCurrent(controller)) return;

      if (response.data.length === 0) {
        filters.replaceChildren(
          createEmptyState("No game categories are available yet."),
        );
        return;
      }

      const defaultCategory = response.data.find(
        (category) => category.isDefault,
      );
      if (!defaultCategory) {
        throw new Error("The categories response has no default category.");
      }

      chips = createFilterChips(
        response.data,
        currentQuery.category,
        callbacks.onFilterChange,
      );
      filters.replaceChildren(...chips.elements);
    } catch (error) {
      if (!request.isCurrent(controller)) return;

      const message = getErrorMessage(
        error,
        "The game categories could not be loaded.",
      );
      snackbar.show("The game categories could not be loaded.", "error");
      filters.replaceChildren(
        createErrorState(message, (): void => void loadCategories()),
      );
    } finally {
      request.finish(controller);
    }
  };

  section.append(filters, sortControl.element);
  void loadCategories();

  return {
    element: section,
    update: (query): void => {
      currentQuery = query;
      chips?.setSelected(query.category);
      sortControl.setValue(query.sort);
    },
    destroy: (): void => {
      request.cancel();
      sortControl.destroy();
    },
  };
};
