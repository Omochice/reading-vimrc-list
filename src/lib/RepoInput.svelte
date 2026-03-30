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
  <form onsubmit={handleSubmit}>
    <input type="text" bind:value={url} placeholder="owner/repo or https://github.com/owner/repo" />
    <button type="submit">Submit</button>
    {#if error}
      <p role="alert">{error}</p>
    {/if}
  </form>
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

  .subtitle {
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
    font-size: 16px;
    color: var(--foreground-secondary, #6b7280);
    text-align: center;
    margin: 0;
    white-space: pre-line;
  }
</style>
