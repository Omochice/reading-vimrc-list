<script lang="ts">
  import type { TreeNode } from "./types";
  import TreeNodeComponent from "./TreeNode.svelte";
  import { fetchDefaultBranch, fetchTree } from "./fetchTree";
  import { buildTree } from "./buildTree";
  import { buildCommand } from "./buildCommand";

  type Props = {
    owner: string;
    repo: string;
  };

  let { owner, repo }: Props = $props();

  let tree = $state<TreeNode[]>([]);
  let branch = $state("");
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedPaths = $state(new Set<string>());
  let toastVisible = $state(false);

  function getAllFilePaths(node: TreeNode): string[] {
    if (node.type === "file") return [node.path];
    return node.children.flatMap(getAllFilePaths);
  }

  function handleToggle(path: string) {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    selectedPaths = next;
  }

  function handleDirectoryToggle(node: TreeNode, checked: boolean) {
    const paths = getAllFilePaths(node);
    const next = new Set(selectedPaths);
    for (const p of paths) {
      if (checked) {
        next.add(p);
      } else {
        next.delete(p);
      }
    }
    selectedPaths = next;
  }

  async function handleCopy() {
    const command = buildCommand(owner, repo, branch, selectedPaths, tree);
    await navigator.clipboard.writeText(command);
    toastVisible = true;
    setTimeout(() => { toastVisible = false; }, 3000);
  }

  async function load() {
    try {
      branch = await fetchDefaultBranch(owner, repo);
      const entries = await fetchTree(owner, repo, branch);
      tree = buildTree(entries);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  load();
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p role="alert">{error}</p>
{:else}
  <div>
    {#each tree as node}
      <TreeNodeComponent
        {node}
        {selectedPaths}
        onToggle={handleToggle}
        onDirectoryToggle={handleDirectoryToggle}
      />
    {/each}
  </div>
  <button
    disabled={selectedPaths.size === 0}
    onclick={handleCopy}
  >
    Copy
  </button>
  {#if toastVisible}
    <p role="status">Copied to clipboard</p>
  {/if}
{/if}
