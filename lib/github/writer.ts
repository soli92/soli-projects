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

  const body = JSON.stringify({
    message: params.message,
    content: Buffer.from(params.content, "utf-8").toString("base64"),
    branch,
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
