export type NodeType = "file" | "directory";

export type TreeNode = {
  name: string;
  path: string;
  type: NodeType;
  children: TreeNode[];
};
