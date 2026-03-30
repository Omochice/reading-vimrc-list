import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchDefaultBranch, fetchTree } from "./fetchTree";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchDefaultBranch", () => {
  it("returns the default_branch field from the API response", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ default_branch: "main" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse as unknown as Response,
    );

    const branch = await fetchDefaultBranch("vim-jp", "reading-vimrc");

    expect(branch).toBe("main");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/vim-jp/reading-vimrc",
    );
  });
});

describe("fetchTree", () => {
  it("returns tree entries from the API response", async () => {
    const treeData = [
      { path: "src/main.ts", type: "blob" },
      { path: "src/utils", type: "tree" },
    ];
    const mockResponse = {
      ok: true,
      json: async () => ({ tree: treeData, truncated: false }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse as unknown as Response,
    );

    const result = await fetchTree("vim-jp", "reading-vimrc", "main");

    expect(result).toEqual([
      { path: "src/main.ts", type: "blob" },
      { path: "src/utils", type: "tree" },
    ]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/vim-jp/reading-vimrc/git/trees/main?recursive=1",
    );
  });
});

describe("error handling", () => {
  it("fetchDefaultBranch throws on 404 response", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse as unknown as Response,
    );

    await expect(
      fetchDefaultBranch("vim-jp", "nonexistent"),
    ).rejects.toThrow("Failed to fetch repository: 404 Not Found");
  });

  it("fetchTree throws on 404 response", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse as unknown as Response,
    );

    await expect(
      fetchTree("vim-jp", "reading-vimrc", "nonexistent"),
    ).rejects.toThrow("Failed to fetch tree: 404 Not Found");
  });

  it("fetchDefaultBranch throws on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(
      fetchDefaultBranch("vim-jp", "reading-vimrc"),
    ).rejects.toThrow("Failed to fetch");
  });

  it("fetchTree throws on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(
      fetchTree("vim-jp", "reading-vimrc", "main"),
    ).rejects.toThrow("Failed to fetch");
  });
});
