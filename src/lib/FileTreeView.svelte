<script lang="ts">
  import type { TreeNode } from "./types";
  import TreeNodeComponent from "./TreeNode.svelte";
  import { fetchDefaultBranch, fetchTree } from "./fetchTree";
  import { buildTree } from "./buildTree";
  import { buildCommand } from "./buildCommand";
  import { FolderGit2, GitBranch } from "lucide-svelte";

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
  <div class="repo-info">
    <FolderGit2 size={20} color="var(--accent-primary, #6366F1)" />
    <span class="repo-name">{owner} / {repo}</span>
    <span class="branch-badge">
      <GitBranch size={14} color="var(--accent-primary, #6366F1)" />
      <span>{branch}</span>
    </span>
  </div>
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
