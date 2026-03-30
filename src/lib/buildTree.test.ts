import { describe, it, expect } from "vitest";
import { buildTree } from "./buildTree";

describe("buildTree", () => {
  it("converts a single blob entry into a root-level file node", () => {
    const entries = [{ path: "README.md", type: "blob" as const }];
    const result = buildTree(entries);
    expect(result).toEqual([
      {
        name: "README.md",
        path: "README.md",
        type: "file",
        children: [],
      },
    ]);
  });

  it("groups multiple files under the same directory", () => {
    const entries = [
      { path: "src/main.ts", type: "blob" as const },
      { path: "src/app.ts", type: "blob" as const },
    ];
    const result = buildTree(entries);
    expect(result).toEqual([
      {
        name: "src",
        path: "src",
        type: "directory",
        children: [
          { name: "app.ts", path: "src/app.ts", type: "file", children: [] },
          { name: "main.ts", path: "src/main.ts", type: "file", children: [] },
        ],
      },
    ]);
  });

  it("handles deeply nested directories", () => {
    const entries = [
      { path: "src/lib/main.ts", type: "blob" as const },
    ];
    const result = buildTree(entries);
    expect(result).toEqual([
      {
        name: "src",
        path: "src",
        type: "directory",
        children: [
          {
            name: "lib",
            path: "src/lib",
            type: "directory",
            children: [
              {
                name: "main.ts",
                path: "src/lib/main.ts",
                type: "file",
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("sorts directories before files and alphabetically within each group", () => {
    const entries = [
      { path: "zebra.txt", type: "blob" as const },
      { path: "src/index.ts", type: "blob" as const },
      { path: "alpha.txt", type: "blob" as const },
      { path: "docs/guide.md", type: "blob" as const },
    ];
    const result = buildTree(entries);
    expect(result.map((n) => ({ name: n.name, type: n.type }))).toEqual([
      { name: "docs", type: "directory" },
      { name: "src", type: "directory" },
      { name: "alpha.txt", type: "file" },
      { name: "zebra.txt", type: "file" },
    ]);
  });

  it("ignores tree-type entries from the API", () => {
    const entries = [
      { path: "src", type: "tree" as const },
      { path: "src/main.ts", type: "blob" as const },
    ];
    const result = buildTree(entries);
    expect(result).toEqual([
      {
        name: "src",
        path: "src",
        type: "directory",
        children: [
          { name: "main.ts", path: "src/main.ts", type: "file", children: [] },
        ],
      },
    ]);
  });
});
