export async function fetchDefaultBranch(
  owner: string,
  repo: string,
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch repository: ${response.status} ${response.statusText}`,
    );
  }
  const data = await response.json();
  return data.default_branch;
}

export async function fetchTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<Array<{ path: string; type: "blob" | "tree" }>> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch tree: ${response.status} ${response.statusText}`,
    );
  }
  const data = await response.json();
  return data.tree.map((entry: { path: string; type: "blob" | "tree" }) => ({
    path: entry.path,
    type: entry.type,
  }));
}
