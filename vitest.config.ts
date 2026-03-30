import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte({ compilerOptions: { compatibility: { componentApi: 4 } } })],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    passWithNoTests: true,
  },
});
