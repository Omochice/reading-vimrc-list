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

  it("shows Repository Not Found title when fetch fails", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("Repository Not Found")).toBeTruthy();
    });
  });

  it("shows error description when fetch fails", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/couldn't fetch the repository/),
      ).toBeTruthy();
    });
  });

  it("renders Go Back button on error", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo", onBack: () => {} },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Go Back" }),
      ).toBeTruthy();
    });
  });

  it("renders Try Again button on error", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Try Again" }),
      ).toBeTruthy();
    });
  });

  it("Try Again retries the fetch", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Try Again" }),
      ).toBeTruthy();
    });

    const callsBefore = mockFetchDefaultBranch.mock.calls.length;
    const retryButton = screen.getByRole("button", { name: "Try Again" });
    await fireEvent.click(retryButton);

    expect(mockFetchDefaultBranch.mock.calls.length).toBe(callsBefore + 1);
  });

  it("shows Possible reasons heading when error occurs", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("Possible reasons")).toBeTruthy();
    });
  });

  it("shows hint about private repositories", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("The repository may be private or restricted"),
      ).toBeTruthy();
    });
  });

  it("shows Back button in error header", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo", onBack: () => {} },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Back/ })).toBeTruthy();
    });
  });

  it("shows repo name in error header", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("test-owner / test-repo")).toBeTruthy();
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

  it("renders Select files header text", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("Select files")).toBeTruthy();
    });
  });

  it("renders item count in header", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText(/\d+ items/)).toBeTruthy();
    });
  });

  it("renders selected file count in footer", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText(/0 files selected/)).toBeTruthy();
    });
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

  it("displays owner and repo name after loading", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText(/test-owner/)).toBeTruthy();
    });
    expect(screen.getByText(/test-repo/)).toBeTruthy();
  });

  it("displays branch name in a badge after loading", async () => {
    setupSuccessfulFetch();

    render(FileTreeView, {
      props: { owner: "test-owner", repo: "test-repo" },
    });

    await waitFor(() => {
      expect(screen.getByText("main")).toBeTruthy();
    });
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
