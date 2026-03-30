import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import FileTreeView from "./FileTreeView.svelte";

vi.mock("./fetchTree", () => ({
  fetchDefaultBranch: vi.fn(),
  fetchTree: vi.fn(),
}));

import { fetchDefaultBranch, fetchTree } from "./fetchTree";

const mockFetchDefaultBranch = vi.mocked(fetchDefaultBranch);
const mockFetchTree = vi.mocked(fetchTree);

describe("FileTreeView", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows a loading indicator initially", () => {
    mockFetchDefaultBranch.mockReturnValue(new Promise(() => {}));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  function setupSuccessfulFetch() {
    mockFetchDefaultBranch.mockResolvedValue("main");
    mockFetchTree.mockResolvedValue([
      { path: "src/main.ts", type: "blob" },
      { path: "README.md", type: "blob" },
    ]);
  }

  it("displays tree nodes after successful fetch", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("src")).toBeTruthy();
    });
    expect(screen.getByText("README.md")).toBeTruthy();
  });

  it("shows an error message when fetch fails", async () => {
    mockFetchDefaultBranch.mockRejectedValue(
      new Error("Failed to fetch repository: 404 Not Found"),
    );

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch repository: 404 Not Found"),
      ).toBeTruthy();
    });
  });

  it("toggles file selection when checkbox is clicked", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeTruthy();
    });

    const readmeCheckbox = screen.getByText("README.md")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;

    await fireEvent.click(readmeCheckbox);
    expect(readmeCheckbox.checked).toBe(true);

    await fireEvent.click(readmeCheckbox);
    expect(readmeCheckbox.checked).toBe(false);
  });

  it("selects all descendant files when directory checkbox is checked", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("src")).toBeTruthy();
    });

    const dirCheckbox = screen.getByText("src")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;

    await fireEvent.click(dirCheckbox);

    // Expand the directory to verify child is selected
    const toggleBtn = screen.getByRole("button", { name: /toggle/i });
    await fireEvent.click(toggleBtn);

    const childCheckbox = screen.getByText("main.ts")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;

    expect(childCheckbox.checked).toBe(true);
  });

  it("disables copy button when no files are selected", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("Copy")).toBeTruthy();
    });

    const copyButton = screen.getByText("Copy") as HTMLButtonElement;
    expect(copyButton.disabled).toBe(true);
  });

  it("enables copy button when files are selected", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeTruthy();
    });

    const readmeCheckbox = screen.getByText("README.md")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;

    await fireEvent.click(readmeCheckbox);

    const copyButton = screen.getByText("Copy") as HTMLButtonElement;
    expect(copyButton.disabled).toBe(false);
  });

  it("shows indeterminate state on directory when some descendants are selected", async () => {
    mockFetchDefaultBranch.mockResolvedValue("main");
    mockFetchTree.mockResolvedValue([
      { path: "src/a.ts", type: "blob" },
      { path: "src/b.ts", type: "blob" },
    ]);

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("src")).toBeTruthy();
    });

    // Expand directory
    const toggleBtn = screen.getByRole("button", { name: /toggle/i });
    await fireEvent.click(toggleBtn);

    // Select only one child
    const aCheckbox = screen.getByText("a.ts")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;
    await fireEvent.click(aCheckbox);

    // Directory checkbox should be indeterminate
    const dirCheckbox = screen.getByText("src")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;
    expect(dirCheckbox.indeterminate).toBe(true);
  });

  it("writes command to clipboard when copy button is clicked", async () => {
    setupSuccessfulFetch();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("README.md")).toBeTruthy();
    });

    const readmeCheckbox = screen.getByText("README.md")
      .closest("label")!
      .querySelector("input") as HTMLInputElement;

    await fireEvent.click(readmeCheckbox);

    const copyButton = screen.getByText("Copy");
    await fireEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(
      "!reading_vimrc next https://github.com/test-owner/test-repo/blob/main/README.md",
    );

    await waitFor(() => {
      expect(screen.getByText("Copied to clipboard")).toBeTruthy();
    });
  });
});
