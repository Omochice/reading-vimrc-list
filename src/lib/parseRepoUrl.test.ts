import { describe, expect, test } from "vitest";
import { parseRepoUrl } from "./parseRepoUrl";

describe("parseRepoUrl", () => {
  test("returns owner and repo for a valid GitHub URL", () => {
    const result = parseRepoUrl("https://github.com/owner/repo");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  test("returns null for a random string", () => {
    expect(parseRepoUrl("not-a-url")).toBeNull();
  });

  test("returns null for a non-https URL", () => {
    expect(parseRepoUrl("http://github.com/owner/repo")).toBeNull();
  });

  test("returns null for a non-GitHub domain", () => {
    expect(parseRepoUrl("https://gitlab.com/owner/repo")).toBeNull();
  });

  test("returns owner and repo for a URL with trailing slash", () => {
    const result = parseRepoUrl("https://github.com/owner/repo/");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  test("returns null for a URL with extra path segments", () => {
    expect(
      parseRepoUrl("https://github.com/owner/repo/tree/main"),
    ).toBeNull();
  });

  test("returns null when owner is empty", () => {
    expect(parseRepoUrl("https://github.com//repo")).toBeNull();
  });

  test("returns null when repo is empty", () => {
    expect(parseRepoUrl("https://github.com/owner/")).toBeNull();
  });

  test("returns null for GitHub root URL", () => {
    expect(parseRepoUrl("https://github.com/")).toBeNull();
  });
});
