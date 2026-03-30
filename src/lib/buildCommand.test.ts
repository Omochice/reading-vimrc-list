import { describe, expect, it } from "vitest";
import { buildCommand } from "./buildCommand";
import type { TreeNode } from "./types";

describe("buildCommand", () => {
  it("returns a command with a single file URL when one file is selected", () => {
    const tree: TreeNode[] = [
      { name: "init.lua", path: "init.lua", type: "file", children: [] },
    ];
    const selected = new Set(["init.lua"]);

    const result = buildCommand("owner", "repo", "main", selected, tree);

    expect(result).toBe(
      "!reading_vimrc next https://github.com/owner/repo/blob/main/init.lua",
    );
  });

  it("returns space-separated URLs when multiple files are selected", () => {
    const tree: TreeNode[] = [
      { name: "init.lua", path: "init.lua", type: "file", children: [] },
      { name: "options.lua", path: "options.lua", type: "file", children: [] },
    ];
    const selected = new Set(["init.lua", "options.lua"]);

    const result = buildCommand("owner", "repo", "main", selected, tree);

    expect(result).toBe(
      "!reading_vimrc next https://github.com/owner/repo/blob/main/init.lua https://github.com/owner/repo/blob/main/options.lua",
    );
  });

  it("orders URLs by depth-first tree traversal, not by Set insertion order", () => {
    const tree: TreeNode[] = [
      {
        name: "lua",
        path: "lua",
        type: "directory",
        children: [
          {
            name: "core",
            path: "lua/core",
            type: "directory",
            children: [
              {
                name: "options.lua",
                path: "lua/core/options.lua",
                type: "file",
                children: [],
              },
            ],
          },
          {
            name: "init.lua",
            path: "lua/init.lua",
            type: "file",
            children: [],
          },
        ],
      },
      { name: "README.md", path: "README.md", type: "file", children: [] },
    ];
    // Set insertion order differs from tree traversal order
    const selected = new Set(["README.md", "lua/init.lua", "lua/core/options.lua"]);

    const result = buildCommand("hydeik", "dotfiles", "main", selected, tree);

    expect(result).toBe(
      "!reading_vimrc next https://github.com/hydeik/dotfiles/blob/main/lua/core/options.lua https://github.com/hydeik/dotfiles/blob/main/lua/init.lua https://github.com/hydeik/dotfiles/blob/main/README.md",
    );
  });
});
