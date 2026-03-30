export function parseRepoUrl(
  input: string,
): { owner: string; repo: string } | null {
  const urlMatch = input.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/,
  );
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  const shortMatch = input.match(/^([^/]+)\/([^/]+?)\/?$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

  return null;
}
