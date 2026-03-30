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

  it("renders NavBar on initial screen", () => {
    render(App);
    expect(screen.getAllByText("!reading_vimrc").length).toBeGreaterThanOrEqual(1);
  });

  it("shows RepoInput on initial render", () => {
    render(App);

    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByRole("button", { name: /submit/i })).toBeTruthy();
  });

  it("renders within #app container with expected layout", () => {
    const { container } = render(App);

    expect(container.querySelector("form")).toBeTruthy();
    expect(container.innerHTML).not.toBe("");
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

describe("integration smoke tests", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("input screen renders NavBar, heading, form card, and footer", () => {
    render(App);
    expect(screen.getAllByText("!reading_vimrc").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Listing App/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("Repository")).toBeTruthy();
    expect(screen.getByText(/Accepted formats/)).toBeTruthy();
    expect(screen.getByText(/A tool for exploring/)).toBeTruthy();
  });

  it("tree screen renders repo info and tree card", async () => {
    mockFetchDefaultBranch.mockResolvedValue("main");
    mockFetchTree.mockResolvedValue([
      { path: "README.md", type: "blob" },
    ]);

    render(App);
    const input = screen.getByRole("textbox");
    await fireEvent.input(input, { target: { value: "vim/vim" } });
    await fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Select files")).toBeTruthy();
    });
    expect(screen.getByText(/main/)).toBeTruthy();
    expect(screen.getByText("README.md")).toBeTruthy();
    expect(screen.getByText(/0 files selected/)).toBeTruthy();
  });

  it("error screen renders error card with actions", async () => {
    mockFetchDefaultBranch.mockRejectedValue(new Error("Not Found"));

    render(App);
    const input = screen.getByRole("textbox");
    await fireEvent.input(input, { target: { value: "vim/vim" } });
    await fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Repository Not Found")).toBeTruthy();
    });
    expect(screen.getByText(/couldn't fetch/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go Back" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeTruthy();
    expect(screen.getByText("Possible reasons")).toBeTruthy();
  });
});
