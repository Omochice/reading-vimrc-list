<script lang="ts">
  import { BookOpen } from "lucide-svelte";
</script>

<header class="navbar">
  <BookOpen size={20} color="var(--accent-primary, #6366F1)" />
  <span class="title">
    <span class="mono">!reading_vimrc</span>
    <span class="sans"> Listing App</span>
  </span>
</header>

<style>
  .navbar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 56px;
    padding: 0 24px;
    background: var(--surface-card, #fff);
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .title {
    display: flex;
    align-items: baseline;
  }

  .mono {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 16px;
    font-weight: 600;
    color: var(--foreground-primary, #1a1a1a);
  }

  .sans {
    font-family: var(--font-sans, system-ui, sans-serif);
    font-size: 16px;
    font-weight: 600;
    color: var(--foreground-primary, #1a1a1a);
  }
</style>
