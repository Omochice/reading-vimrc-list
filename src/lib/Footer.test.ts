import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Footer from "./Footer.svelte";

describe("Footer", () => {
  it("renders footer text", () => {
    render(Footer);
    expect(screen.getByText(/GitHub:/)).toBeTruthy();
  });

  it("renders as a footer element", () => {
    const { container } = render(Footer);
    expect(container.querySelector("footer")).toBeTruthy();
  });
});
