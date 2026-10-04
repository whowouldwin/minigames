import "./library-controls.scss";
import { getErrorMessage, getLibraryCategories } from "../../api";
import type {
  GameCategorySlug,
  GameSortValue,
  LibraryGamesQuery,
} from "../../api";
import {
  createEmptyState,
  createErrorState,
  createRequestSkeleton,
} from "../ui/request-feedback";
import type { SnackbarController } from "../ui/snackbar";
import { createFilterChips } from "./create-filter-chips";
import { createSortControl } from "./create-sort-control";
import { defaultSortOption } from "./sort-options";

export interface LibraryControlsCallbacks {
  onFilterChange: (query: LibraryGamesQuery) => void;
  onSortChange: (sort: GameSortValue) => void;
}

export const createLibraryControls = (
  callbacks: LibraryControlsCallbacks,
  snackbar: SnackbarController,
): HTMLElement => {
  const section: HTMLElement = document.createElement("section");
  section.className = "library-controls";
  section.setAttribute("aria-label", "Filter and sort games");

  const filters: HTMLDivElement = document.createElement("div");
  filters.className = "library-controls__filters";
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "Filter games by category");

  let selectedSort = defaultSortOption.value;
  const sortControl = createSortControl((sort: GameSortValue): void => {
    selectedSort = sort;
    callbacks.onSortChange(sort);
  });

  const loadCategories = async (): Promise<void> => {
    filters.replaceChildren(
      createRequestSkeleton("Loading game categories", "chips", 7),
    );

    try {
      const response = await getLibraryCategories();
      if (!section.isConnected) return;

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

      filters.replaceChildren(
        ...createFilterChips(
          response.data,
          defaultCategory.slug,
          (category: GameCategorySlug): void => {
            callbacks.onFilterChange({ category, sort: selectedSort, page: 1 });
          },
        ),
      );
      callbacks.onFilterChange({
        category: defaultCategory.slug,
        sort: selectedSort,
        page: 1,
      });
    } catch (error) {
      if (!section.isConnected) return;

      const message = getErrorMessage(
        error,
        "The game categories could not be loaded.",
      );
      snackbar.show("The game categories could not be loaded.", "error");
      filters.replaceChildren(
        createErrorState(message, (): void => void loadCategories()),
      );
    }
  };

  section.append(filters, sortControl);
  void loadCategories();

  return section;
};
