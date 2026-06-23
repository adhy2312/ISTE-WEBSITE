import { NextResponse } from 'next/server';

/**
 * GitHub Sync API
 * POST with { repoUrl: "https://github.com/user/repo" }
 * Returns GitHub metadata: stars, description, language, topics
 * Used to pre-populate Sanity memberProject documents.
 */
export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) {
      return NextResponse.json({ error: 'repoUrl required' }, { status: 400 });
    }

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // Fetch from GitHub public API (no auth needed for public repos)
    const apiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;
    const ghRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return NextResponse.json({ error: 'Repository not found or private' }, { status: 404 });
      }
      return NextResponse.json({ error: 'GitHub API error' }, { status: 502 });
    }

    const data = await ghRes.json();

    return NextResponse.json({
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || [],
      homepageUrl: data.homepage,
      isPrivate: data.private,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    console.error('[GitHub Sync] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
