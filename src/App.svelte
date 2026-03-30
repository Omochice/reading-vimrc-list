<script lang="ts">
  import RepoInput from "./lib/RepoInput.svelte";
  import FileTreeView from "./lib/FileTreeView.svelte";

  type Screen =
    | { screen: "input" }
    | { screen: "tree"; owner: string; repo: string };

  let current = $state<Screen>({ screen: "input" });

  function handleSubmit({ owner, repo }: { owner: string; repo: string }) {
    current = { screen: "tree", owner, repo };
  }
</script>

{#if current.screen === "input"}
  <RepoInput onSubmit={handleSubmit} />
{:else}
  <FileTreeView owner={current.owner} repo={current.repo} />
{/if}
