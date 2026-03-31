<script lang="ts">
  import { parseRepoUrl } from "./parseRepoUrl";

  interface Props {
    onSubmit: (result: { owner: string; repo: string }) => void;
  }

  let { onSubmit }: Props = $props();
  let url = $state("");
  let error = $state("");

  function handleSubmit(e: Event) {
    e.preventDefault();
    const result = parseRepoUrl(url);
    if (result) {
      error = "";
      onSubmit(result);
    } else {
      error = "Invalid GitHub repository URL";
    }
  }
</script>

<div class="container">
  <h1><span class="mono">!reading_vimrc</span><span class="sans"> Listing App</span></h1>
  <p class="subtitle">Explore and discover vimrc configurations from any GitHub repository.
Find inspiration for your own Vim setup.</p>
  <div class="card">
    <label for="repo-input">Repository</label>
    <form class:has-error={error} onsubmit={handleSubmit}>
      <input id="repo-input" type="text" bind:value={url} placeholder="owner/repo or https://github.com/owner/repo" aria-invalid={error ? "true" : undefined} />
      <button type="submit">Submit</button>
    </form>
    {#if error}
      <p role="alert">{error}</p>
    {/if}
  </div>
  <p class="helper">Accepted formats: owner/repo  ·  https://github.com/owner/repo</p>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 24px;
    padding: 0 24px;
  }

  h1 {
    margin: 0;
  }

  h1 .mono {
    font-family: var(--font-mono, "Geist Mono", monospace);
    font-size: 32px;
    font-weight: 700;
  }

  h1 .sans {
    font-family: var(--font-heading, "Geist", system-ui, sans-serif);
    font-size: 32px;
    font-weight: 700;
  }

  .card {
    background: var(--surface-card, #fff);
    border-radius: var(--radius-lg, 12px);
    box-shadow: 0 4px 16px var(--shadow-color);
    padding: 28px;
    width: 480px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .card label {
    font-family: var(--font-body, system-ui, sans-serif);
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground-primary, #1a1a1a);
  }

  form {
    display: flex;
    gap: 12px;
  }

  form input {
    flex: 1;
    height: 44px;
    background: var(--surface-input, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-sm, 6px);
    font-family: var(--font-mono, monospace);
    font-size: 14px;
    padding: 0 14px;
    color: var(--foreground-primary, #1a1a1a);
    box-sizing: border-box;
  }

  form button {
    border-radius: var(--radius-sm, 6px);
    background: var(--accent-primary, #6366f1);
    height: 44px;
    padding: 0 24px;
    border: none;
    font-family: var(--font-body, system-ui, sans-serif);
    font-size: 14px;
    font-weight: 600;
    color: var(--foreground-inverse, #fff);
    cursor: pointer;
    white-space: nowrap;
  }

  form input[aria-invalid="true"] {
    background: var(--error-light, #fef2f2);
    border-color: var(--error, #ef4444);
  }

  form.has-error {
    flex-direction: column;
  }

  form.has-error input {
    width: 100%;
    flex: none;
  }

  form.has-error button {
    width: 100%;
  }

  .card [role="alert"] {
    font-family: var(--font-body, system-ui, sans-serif);
    font-size: 13px;
    color: var(--error, #ef4444);
    margin: 0;
  }

  .subtitle {
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
    font-size: 16px;
    color: var(--foreground-secondary, #6b7280);
    text-align: center;
    margin: 0;
    white-space: pre-line;
  }

  .helper {
    font-family: var(--font-mono, monospace);
    font-size: 12px;
    color: var(--foreground-muted, #9ca3af);
    text-align: center;
    margin: 0;
  }
</style>
