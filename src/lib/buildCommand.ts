import type { TreeNode } from "./types";

function collectSelectedPaths(
  tree: TreeNode[],
  selectedPaths: Set<string>,
): string[] {
  const result: string[] = [];
  for (const node of tree) {
    if (node.type === "file" && selectedPaths.has(node.path)) {
      result.push(node.path);
    }
    if (node.children.length > 0) {
      result.push(...collectSelectedPaths(node.children, selectedPaths));
    }
  }
  return result;
}

export function buildCommand(
  owner: string,
  repo: string,
  branch: string,
  selectedPaths: Set<string>,
  tree: TreeNode[],
): string {
  const paths = collectSelectedPaths(tree, selectedPaths);
  const urls = paths.map(
    (p) => `https://github.com/${owner}/${repo}/blob/${branch}/${p}`,
  );
  return `!reading_vimrc next ${urls.join(" ")}`;
}
