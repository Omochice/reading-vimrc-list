<script lang="ts">
  import type { TreeNode } from "./types";
  import Self from "./TreeNode.svelte";
  import { Folder, FolderOpen, FileText, Check } from "lucide-svelte";

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
  <div class="tree-row file-row" class:selected={selectedPaths.has(node.path)} style="padding-left: {16 + depth * 24}px">
    <label class="tree-label">
      <span class="checkbox-wrapper">
        <input type="checkbox" class="sr-only" checked={selectedPaths.has(node.path)} onchange={() => onToggle(node.path)} />
        <span class="checkbox-visual" class:checked={selectedPaths.has(node.path)}>
          {#if selectedPaths.has(node.path)}
            <Check size={12} color="var(--foreground-inverse, #fff)" />
          {/if}
        </span>
      </span>
      <FileText size={16} color="var(--foreground-muted, #9ca3af)" />
      <span class="node-name">{node.name}</span>
    </label>
  </div>
{:else}
  <div class="tree-row dir-row" style="padding-left: {16 + depth * 24}px">
    <button aria-label="toggle" class="toggle-btn" onclick={() => { expanded = !expanded; }}>
      {expanded ? "▼" : "▶"}
    </button>
    <label class="tree-label">
      <span class="checkbox-wrapper">
        <input type="checkbox" class="sr-only" checked={getCheckState(node) === "checked"} indeterminate={getCheckState(node) === "indeterminate"} onchange={(e) => onDirectoryToggle(node, (e.target as HTMLInputElement).checked)} />
        <span class="checkbox-visual" class:checked={getCheckState(node) === "checked"} class:indeterminate={getCheckState(node) === "indeterminate"}>
          {#if getCheckState(node) === "checked"}
            <Check size={12} color="var(--foreground-inverse, #fff)" />
          {:else if getCheckState(node) === "indeterminate"}
            <span class="dash"></span>
          {/if}
        </span>
      </span>
      {#if expanded}
        <FolderOpen size={18} color="var(--accent-primary, #6366F1)" />
      {:else}
        <Folder size={18} color="var(--foreground-muted, #9ca3af)" />
      {/if}
      <span class="node-name">{node.name}</span>
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

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .tree-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dir-row {
    height: 44px;
  }

  .file-row {
    height: 40px;
  }

  .file-row.selected {
    background: var(--accent-light);
  }

  .tree-label {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--foreground-primary);
  }

  .checkbox-wrapper {
    position: relative;
    display: inline-flex;
  }

  .checkbox-visual {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--border);
    background: transparent;
  }

  .checkbox-visual.checked,
  .checkbox-visual.indeterminate {
    background: var(--checked-bg);
    border-color: var(--checked-bg);
  }

  .dash {
    width: 10px;
    height: 2px;
    background: var(--foreground-inverse);
    border-radius: 1px;
  }

  .toggle-btn {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    color: var(--foreground-secondary);
  }
</style>
