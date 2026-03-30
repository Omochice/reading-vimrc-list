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

<form onsubmit={handleSubmit}>
  <input type="text" bind:value={url} />
  <button type="submit">Submit</button>
  {#if error}
    <p role="alert">{error}</p>
  {/if}
</form>
