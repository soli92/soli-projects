/**
 * GitHub Contents API helper. Read-only.
 * Pattern di lazy init: token controllato al primo uso.
 * Coerente con soli-prof lib/rag-service/github.ts.
 */

export interface GitHubFileTarget {
  owner: string;
  repo: string;
  branch?: string;
  path: string;
}

export class GitHubFetchError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GitHubFetchError";
  }
}

/**
 * Fetcha il contenuto di un file da GitHub.
 * Ritorna stringa raw, oppure null se 404.
 * Lancia GitHubFetchError per altri errori.
 */
export async function fetchTextFile(target: GitHubFileTarget): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubFetchError("GITHUB_TOKEN non configurato");
  }

  const branch = target.branch ?? "main";
  const path = encodeURIComponent(target.path);
  const url = `https://api.github.com/repos/${target.owner}/${target.repo}/contents/${path}?ref=${branch}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3.raw",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubFetchError(
      `GitHub fetch failed: ${res.status} ${res.statusText}`,
      res.status
    );
  }

  return await res.text();
}

/**
 * Recupera i metadati dell'ultimo commit di un repo (data + sha + message).
 * Usato per popolare pm_projects.last_activity_at.
 */
export interface LastCommitInfo {
  sha: string;
  message: string;
  date: string; // ISO
}

export async function fetchLastCommit(
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<LastCommitInfo | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubFetchError("GITHUB_TOKEN non configurato");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubFetchError(`GitHub commit fetch failed: ${res.status}`, res.status);
  }

  const json = (await res.json()) as {
    sha: string;
    commit: { message: string; author: { date: string } };
  };
  return {
    sha: json.sha,
    message: json.commit.message,
    date: json.commit.author.date,
  };
}
