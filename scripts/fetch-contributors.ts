import { Octokit } from '@octokit/rest';

export interface Contributor {
  login: string;
  avatarUrl: string;
  contributions: number;
}

export async function fetchContributors(opts: {
  owner: string;
  repo: string;
  token?: string;
  max: number;
  excludeBots: boolean;
}): Promise<Contributor[]> {
  const octokit = new Octokit({ auth: opts.token });
  const res = await octokit.repos.listContributors({
    owner: opts.owner,
    repo: opts.repo,
    per_page: 100,
  });
  let list = res.data
    .filter(c => c.login && c.avatar_url)
    .map(c => ({
      login: c.login!,
      avatarUrl: c.avatar_url!,
      contributions: c.contributions ?? 0,
    }));
  if (opts.excludeBots) {
    list = list.filter(c => !c.login.endsWith('[bot]'));
  }
  list.sort((a, b) => b.contributions - a.contributions);
  return list.slice(0, opts.max);
}
