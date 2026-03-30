export function parseRepoUrl(
  url: string,
): { owner: string; repo: string } | null {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/,
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
