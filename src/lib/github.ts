export async function getRepositoryReadme(repository: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/readme`, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}
