import { render, screen, cleanup } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import NavBar from "./NavBar.svelte";

describe("NavBar", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders the app title with reading_vimrc text", () => {
    render(NavBar);
    expect(screen.getByText("!reading_vimrc")).toBeTruthy();
  });

  it("renders Listing App text", () => {
    const { container } = render(NavBar);
    const match = container.querySelector(".sans");
    expect(match).toBeTruthy();
    expect(match?.textContent).toMatch(/Listing App/);
  });

  it("renders as a header element", () => {
    const { container } = render(NavBar);
    expect(container.querySelector("header")).toBeTruthy();
  });
});
