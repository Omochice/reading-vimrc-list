<script lang="ts">
  import NavBar from "./lib/NavBar.svelte";
  import RepoInput from "./lib/RepoInput.svelte";
  import FileTreeView from "./lib/FileTreeView.svelte";
  import Footer from "./lib/Footer.svelte";

  type Screen =
    | { screen: "input" }
    | { screen: "tree"; owner: string; repo: string };

  let current = $state<Screen>({ screen: "input" });

  function handleSubmit({ owner, repo }: { owner: string; repo: string }) {
    current = { screen: "tree", owner, repo };
  }
</script>

<NavBar />
<main>
  {#if current.screen === "input"}
    <RepoInput onSubmit={handleSubmit} />
  {:else}
    <FileTreeView owner={current.owner} repo={current.repo} onBack={() => { current = { screen: "input" }; }} />
  {/if}
</main>
<Footer />

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
