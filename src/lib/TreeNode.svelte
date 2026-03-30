<script lang="ts">
  import type { TreeNode } from "./types";
  import Self from "./TreeNode.svelte";

  type Props = {
    node: TreeNode;
    selectedPaths: Set<string>;
    onToggle: (path: string) => void;
    onDirectoryToggle: (node: TreeNode, checked: boolean) => void;
    depth?: number;
  };

  let { node, selectedPaths, onToggle, onDirectoryToggle, depth = 0 }: Props = $props();

  let expanded = $state(false);

  function getAllFilePaths(n: TreeNode): string[] {
    if (n.type === "file") return [n.path];
    return n.children.flatMap(getAllFilePaths);
  }

  function getCheckState(n: TreeNode): "checked" | "unchecked" | "indeterminate" {
    const paths = getAllFilePaths(n);
    if (paths.length === 0) return "unchecked";
    const selectedCount = paths.filter((p) => selectedPaths.has(p)).length;
    if (selectedCount === 0) return "unchecked";
    if (selectedCount === paths.length) return "checked";
    return "indeterminate";
  }
</script>

{#if node.type === "file"}
  <div style="padding-left: {depth * 20}px">
    <label>
      <input
        type="checkbox"
        checked={selectedPaths.has(node.path)}
        onchange={() => onToggle(node.path)}
      />
      {node.name}
    </label>
  </div>
{:else}
  <div style="padding-left: {depth * 20}px">
    <button
      aria-label="toggle"
      onclick={() => { expanded = !expanded; }}
    >
      {expanded ? "▼" : "▶"}
    </button>
    <label>
      <input
        type="checkbox"
        checked={getCheckState(node) === "checked"}
        indeterminate={getCheckState(node) === "indeterminate"}
        onchange={(e) => onDirectoryToggle(node, (e.target as HTMLInputElement).checked)}
      />
      {node.name}
    </label>
  </div>
  {#if expanded}
    {#each node.children as child}
      <Self
        node={child}
        {selectedPaths}
        {onToggle}
        {onDirectoryToggle}
        depth={depth + 1}
      />
    {/each}
  {/if}
{/if}
