/**
 * GitHub Contents API writer.
 * Creates or updates files in remote repositories via PUT.
 * Used to push directives from soli-projects to vertical repos.
 */

import { GitHubFetchError } from "./client";

export interface CreateFileParams {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
}

export interface CreateFileResult {
  sha: string;
  htmlUrl: string;
}

export async function createFileInRepo(params: CreateFileParams): Promise<CreateFileResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubFetchError("GITHUB_TOKEN non configurato (serve scope repo)");
  }

  const branch = params.branch ?? "main";
  const encodedPath = params.path.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${params.owner}/${params.repo}/contents/${encodedPath}`;

  // La PUT su un path già esistente richiede lo `sha` corrente, altrimenti
  // GitHub risponde 422. Recuperiamo lo sha con un GET (riusando headers/token);
  // se il file non esiste (404) creiamo senza sha.
  const sha = await fetchExistingSha(url, branch, token);

  const body = JSON.stringify({
    message: params.message,
    content: Buffer.from(params.content, "utf-8").toString("base64"),
    branch,
    ...(sha ? { sha } : {}),
  });

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new GitHubFetchError(
      `GitHub PUT failed: ${res.status} ${res.statusText} — ${text}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    content: { sha: string; html_url: string };
  };

  return {
    sha: json.content.sha,
    htmlUrl: json.content.html_url,
  };
}

/**
 * Recupera lo `sha` corrente di un file via GET Contents API.
 * Ritorna null se il file non esiste (404), così la PUT crea da zero.
 * Lancia GitHubFetchError per altri errori.
 */
async function fetchExistingSha(
  url: string,
  branch: string,
  token: string,
): Promise<string | null> {
  const res = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new GitHubFetchError(
      `GitHub GET (sha lookup) failed: ${res.status} ${res.statusText} — ${text}`,
      res.status,
    );
  }

  const json = (await res.json()) as { sha?: string };
  return json.sha ?? null;
}
