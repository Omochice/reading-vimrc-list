import type { TreeNode } from "./types";

type GitTreeEntry = {
  path: string;
  type: "blob" | "tree";
};

export function buildTree(entries: GitTreeEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.type !== "blob") continue;

    const segments = entry.path.split("/");
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isFile = i === segments.length - 1;

      if (isFile) {
        current.push({
          name: segment,
          path: entry.path,
          type: "file",
          children: [],
        });
      } else {
        let dir = current.find(
          (n) => n.type === "directory" && n.name === segment,
        );
        if (!dir) {
          dir = {
            name: segment,
            path: segments.slice(0, i + 1).join("/"),
            type: "directory",
            children: [],
          };
          current.push(dir);
        }
        current = dir.children;
      }
    }
  }

  sortNodes(root);
  return root;
}

function sortNodes(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  for (const node of nodes) {
    if (node.children.length > 0) {
      sortNodes(node.children);
    }
  }
}
