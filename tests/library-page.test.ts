import { describe, expect, it, vi } from "vitest";

const {
  createLibraryControls,
  createLibraryGameList,
  createLibraryPagination,
} = vi.hoisted(() => ({
  createLibraryControls: vi.fn(),
  createLibraryGameList: vi.fn(),
  createLibraryPagination: vi.fn(),
}));
vi.mock("../src/components/library-controls", () => ({
  createLibraryControls,
}));
vi.mock("../src/components/library-game-list", () => ({
  createLibraryGameList,
}));
vi.mock("../src/components/library-pagination", () => ({
  createLibraryPagination,
}));

import { createLibraryPage } from "../src/pages/library";
import type { SnackbarController } from "../src/components/ui/snackbar";

describe("library page coordination", () => {
  it("loads unique queries, updates pagination, and resets the page when filters change", () => {
    const list = {
      element: document.createElement("section"),
      load: vi.fn(),
      cancel: vi.fn(),
    };
    const pagination = {
      element: document.createElement("nav"),
      update: vi.fn(),
      destroy: vi.fn(),
    };
    const controls = {
      element: document.createElement("section"),
      update: vi.fn(),
      destroy: vi.fn(),
    };
    let onPageChange: ((page: number) => void) | undefined;
    let callbacks:
      | {
          onFilterChange: (category: "card") => void;
          onSortChange: (sort: "rating-asc") => void;
        }
      | undefined;
    createLibraryGameList.mockReturnValue(list);
    createLibraryPagination.mockImplementation((handlePageChange) => {
      onPageChange = handlePageChange;
      return pagination;
    });
    createLibraryControls.mockImplementation((pageCallbacks) => {
      callbacks = pageCallbacks;
      return controls;
    });
    const onQueryChange = vi.fn();
    const page = createLibraryPage(
      vi.fn(),
      { show: vi.fn() } as unknown as SnackbarController,
      onQueryChange,
    );
    const query = { category: "puzzle", sort: "name-asc", page: 2 } as const;
    page.update(query);
    page.update(query);
    expect(list.load).toHaveBeenCalledOnce();
    expect(controls.update).toHaveBeenLastCalledWith(query);
    expect(pagination.update).toHaveBeenLastCalledWith(2, 1);

    callbacks?.onFilterChange("card");
    callbacks?.onSortChange("rating-asc");
    onPageChange?.(3);
    expect(onQueryChange.mock.calls).toEqual([
      [{ category: "card", sort: "name-asc", page: 1 }],
      [{ category: "puzzle", sort: "rating-asc", page: 1 }],
      [{ category: "puzzle", sort: "name-asc", page: 3 }],
    ]);
    page.destroy();
    expect(controls.destroy).toHaveBeenCalledOnce();
    expect(list.cancel).toHaveBeenCalledOnce();
    expect(pagination.destroy).toHaveBeenCalledOnce();
  });
});
