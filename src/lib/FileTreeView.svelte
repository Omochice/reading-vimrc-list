<script lang="ts">
  import type { TreeNode } from "./types";
  import TreeNodeComponent from "./TreeNode.svelte";
  import { fetchDefaultBranch, fetchTree } from "./fetchTree";
  import { buildTree } from "./buildTree";
  import { buildCommand } from "./buildCommand";
  import { FolderGit2, GitBranch, Copy } from "lucide-svelte";

  type Props = {
    owner: string;
    repo: string;
    onBack?: () => void;
  };

  let { owner, repo, onBack }: Props = $props();

  let tree = $state<TreeNode[]>([]);
  let branch = $state("");
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedPaths = $state(new Set<string>());
  let toastVisible = $state(false);

  let totalItemCount = $derived(tree.flatMap(getAllFilePaths).length);

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

  function handleRetry() {
    error = null;
    loading = true;
    load();
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
  <div class="error-body" role="alert">
    <div class="repo-header">
      {#if onBack}
        <button class="back-btn" onclick={onBack}>
          <span>&#8592;</span>
          <span>Back</span>
        </button>
      {/if}
      <span class="repo-header-name">{owner} / {repo}</span>
    </div>
    <div class="error-card">
      <div class="error-icon-circle">
        <span class="error-icon-text">!</span>
      </div>
      <h2 class="error-title">Repository Not Found</h2>
      <p class="error-desc">We couldn't fetch the repository. It may not exist or could be private.</p>
      <span class="status-badge">
        <span class="status-dot"></span>
        <span>{error}</span>
      </span>
      <div class="error-divider"></div>
      <div class="error-actions">
        {#if onBack}
          <button class="btn-primary" onclick={onBack}>Go Back</button>
        {/if}
        <button class="btn-outline" onclick={handleRetry}>Try Again</button>
      </div>
    </div>
    <div class="hints">
      <span class="hints-title">Possible reasons</span>
      <ul class="hints-list">
        <li>The repository may be private or restricted</li>
        <li>The URL may contain a typo</li>
        <li>The repository may have been deleted or renamed</li>
      </ul>
    </div>
  </div>
{:else}
  <div class="body">
    <div class="repo-info">
      <FolderGit2 size={20} color="var(--accent-primary, #6366F1)" />
      <span class="repo-name">{owner} / {repo}</span>
      <span class="branch-badge">
        <GitBranch size={14} color="var(--accent-primary, #6366F1)" />
        <span>{branch}</span>
      </span>
    </div>
    <div class="tree-card">
      <div class="card-header">
        <span class="header-label">Select files</span>
        <span class="header-count">{totalItemCount} items</span>
      </div>
      <div class="tree-list">
        {#each tree as node}
          <TreeNodeComponent
            {node}
            {selectedPaths}
            onToggle={handleToggle}
            onDirectoryToggle={handleDirectoryToggle}
          />
        {/each}
      </div>
      <div class="card-divider"></div>
      <div class="card-footer">
        <span class="selected-count">{selectedPaths.size} files selected</span>
        <button class="copy-btn" disabled={selectedPaths.size === 0} onclick={handleCopy}>
          <Copy size={16} color="var(--foreground-inverse, #fff)" />
          Copy
        </button>
      </div>
    </div>
    {#if toastVisible}
      <p role="status">Copied to clipboard</p>
    {/if}
  </div>
{/if}

<style>
  .repo-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .repo-name {
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 600;
    color: var(--foreground-primary);
  }

  .branch-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-light);
    border-radius: 9999px;
    padding: 4px 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    color: var(--accent-primary);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 32px;
    flex: 1;
  }

  .tree-card {
    background: var(--surface-card);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px var(--shadow-color);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
  }

  .header-label {
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    flex: 1;
  }

  .header-count {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--foreground-muted);
  }

  .tree-list {
    padding: 8px 0;
    flex: 1;
    overflow-y: auto;
  }

  .card-divider {
    height: 1px;
    background: var(--border);
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    padding: 0 16px;
  }

  .selected-count {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--foreground-secondary);
    flex: 1;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--accent-primary);
    color: var(--foreground-inverse);
    border: none;
    border-radius: var(--radius-sm);
    padding: 8px 20px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .error-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 0 120px;
    gap: 20px;
  }

  .error-card {
    background: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 8px var(--shadow-color);
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
  }

  .error-icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 9999px;
    background: var(--error-light);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-icon-text {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 700;
    color: var(--error);
  }

  .error-title {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    color: var(--foreground-primary);
    margin: 0;
  }

  .error-desc {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--foreground-secondary);
    text-align: center;
    max-width: 400px;
    line-height: 1.5;
    margin: 0;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--error-light);
    border-radius: 9999px;
    padding: 5px 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    color: var(--error);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--error);
  }

  .error-divider {
    width: 100%;
    height: 1px;
    background: var(--border);
  }

  .error-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .btn-primary {
    background: var(--accent-primary);
    color: var(--foreground-inverse);
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .repo-header {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    align-self: flex-start;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--foreground-secondary);
    cursor: pointer;
  }

  .repo-header-name {
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 600;
    color: var(--foreground-primary);
  }

  .hints {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
  }

  .hints-title {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--foreground-secondary);
  }

  .hints-list {
    list-style: disc;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--foreground-muted);
  }

  .btn-outline {
    background: transparent;
    color: var(--foreground-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
</style>
