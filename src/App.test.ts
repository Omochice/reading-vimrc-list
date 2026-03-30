import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import App from "./App.svelte";

vi.mock("./lib/fetchTree", () => ({
  fetchDefaultBranch: vi.fn(),
  fetchTree: vi.fn(),
}));

import { fetchDefaultBranch, fetchTree } from "./lib/fetchTree";

const mockFetchDefaultBranch = vi.mocked(fetchDefaultBranch);
const mockFetchTree = vi.mocked(fetchTree);

describe("App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows RepoInput on initial render", () => {
    render(App);

    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByRole("button", { name: /submit/i })).toBeTruthy();
  });

  it("transitions to FileTreeView after valid URL submission", async () => {
    mockFetchDefaultBranch.mockReturnValue(new Promise(() => {}));

    render(App);

    const input = screen.getByRole("textbox");
    await fireEvent.input(input, { target: { value: "https://github.com/owner/repo" } });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeTruthy();
    });

    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
