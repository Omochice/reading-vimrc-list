import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { fireEvent } from "@testing-library/svelte";
import TreeNode from "./TreeNode.svelte";
import type { TreeNode as TreeNodeType } from "./types";

const fileNode: TreeNodeType = {
  name: "README.md",
  path: "README.md",
  type: "file",
  children: [],
};

const dirNode: TreeNodeType = {
  name: "src",
  path: "src",
  type: "directory",
  children: [
    { name: "main.ts", path: "src/main.ts", type: "file", children: [] },
    { name: "app.ts", path: "src/app.ts", type: "file", children: [] },
  ],
};

describe("TreeNode", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a file node with name and checkbox", () => {
    render(TreeNode, {
      props: {
        node: fileNode,
        selectedPaths: new Set<string>(),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    expect(screen.getByText("README.md")).toBeTruthy();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeTruthy();
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });

  it("renders a directory node with name, checkbox, and collapse icon", () => {
    render(TreeNode, {
      props: {
        node: dirNode,
        selectedPaths: new Set<string>(),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    expect(screen.getByText("src")).toBeTruthy();
    expect(screen.getByRole("checkbox")).toBeTruthy();
    expect(screen.getByRole("button", { name: /toggle/i })).toBeTruthy();
  });

  it("shows children when the toggle button is clicked", async () => {
    render(TreeNode, {
      props: {
        node: dirNode,
        selectedPaths: new Set<string>(),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    expect(screen.queryByText("main.ts")).toBeNull();

    const toggleButton = screen.getByRole("button", { name: /toggle/i });
    await fireEvent.click(toggleButton);

    expect(screen.getByText("main.ts")).toBeTruthy();
    expect(screen.getByText("app.ts")).toBeTruthy();
  });

  it("renders directories collapsed by default", () => {
    render(TreeNode, {
      props: {
        node: dirNode,
        selectedPaths: new Set<string>(),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    expect(screen.queryByText("main.ts")).toBeNull();
    expect(screen.queryByText("app.ts")).toBeNull();
    expect(screen.getByRole("button", { name: /toggle/i }).textContent).toBe("▶");
  });

  it("renders file icon for file nodes", () => {
    const { container } = render(TreeNode, {
      props: {
        node: fileNode,
        selectedPaths: new Set<string>(),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders folder icon for directory nodes", () => {
    const { container } = render(TreeNode, {
      props: {
        node: dirNode,
        selectedPaths: new Set<string>(),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders file checkbox as checked when path is in selectedPaths", () => {
    render(TreeNode, {
      props: {
        node: fileNode,
        selectedPaths: new Set<string>(["README.md"]),
        onToggle: vi.fn(),
        onDirectoryToggle: vi.fn(),
      },
    });

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
