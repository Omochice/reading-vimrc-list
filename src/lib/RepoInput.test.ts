import { cleanup, render, screen, fireEvent } from "@testing-library/svelte";
import { afterEach, describe, expect, test, vi } from "vitest";
import RepoInput from "./RepoInput.svelte";

describe("RepoInput", () => {
  afterEach(() => cleanup());

  test("renders a text input and a submit button", () => {
    render(RepoInput, { props: { onSubmit: () => {} } });
    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDefined();
  });

  test("calls onSubmit with owner and repo for a valid URL", async () => {
    const onSubmit = vi.fn();
    render(RepoInput, { props: { onSubmit } });

    const input = screen.getByRole("textbox");
    await fireEvent.input(input, {
      target: { value: "https://github.com/vim-jp/reading-vimrc" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      owner: "vim-jp",
      repo: "reading-vimrc",
    });
  });

  test("renders a placeholder with input format examples", () => {
    render(RepoInput, { props: { onSubmit: () => {} } });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.placeholder).toBe(
      "owner/repo or https://github.com/owner/repo",
    );
  });

  test("calls onSubmit with owner and repo for owner/repo shorthand", async () => {
    const onSubmit = vi.fn();
    render(RepoInput, { props: { onSubmit } });

    const input = screen.getByRole("textbox");
    await fireEvent.input(input, {
      target: { value: "vim-jp/reading-vimrc" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      owner: "vim-jp",
      repo: "reading-vimrc",
    });
  });

  test("renders the app heading with reading_vimrc text", () => {
    render(RepoInput, { props: { onSubmit: () => {} } });
    expect(screen.getByText("!reading_vimrc")).toBeDefined();
  });

  test("renders the subtitle", () => {
    render(RepoInput, { props: { onSubmit: () => {} } });
    expect(screen.getByText(/Explore and discover/)).toBeDefined();
  });

  test("renders accepted formats helper text", () => {
    render(RepoInput, { props: { onSubmit: () => {} } });
    expect(screen.getByText(/Accepted formats/)).toBeDefined();
  });

  test("renders a Repository label for the input", () => {
    render(RepoInput, { props: { onSubmit: () => {} } });
    expect(screen.getByLabelText("Repository")).toBeTruthy();
  });

  test("shows error message and does not call onSubmit for an invalid URL", async () => {
    const onSubmit = vi.fn();
    render(RepoInput, { props: { onSubmit } });

    const input = screen.getByRole("textbox");
    await fireEvent.input(input, {
      target: { value: "not-a-valid-url" },
    });
    await fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByRole("alert").textContent).toBe(
      "Invalid GitHub repository URL",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("applies error styling when validation fails", async () => {
    render(RepoInput, { props: { onSubmit: vi.fn() } });
    const input = screen.getByRole("textbox");
    await fireEvent.input(input, { target: { value: "invalid" } });
    await fireEvent.submit(input.closest("form")!);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
