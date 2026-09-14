// digest.js — build the daily "今日摘要" from the day's collected data.
'use strict';

function fmtDelta(n) {
  return n > 0 ? '+' + n : String(n);
}

/**
 * @param {object} github data/github.json-like {daily, weekly, monthly}
 * @param {object} models data/models.json-like {categories}
 * @param {object} feed {items}
 */
function buildDigest(github, models, feed) {
  const items = [];
  const usedFeedLinks = new Set();

  const pushNews = (sourceKeys, fallback) => {
    const pick =
      feed.items.find(
        (it) => sourceKeys.includes(it.source) && !usedFeedLinks.has(it.link)
      ) ||
      (fallback ? feed.items.find((it) => !usedFeedLinks.has(it.link)) : null);
    if (!pick) return;
    usedFeedLinks.add(pick.link);
    const srcLabel = pick.sourceLabel && pick.sourceLabel.zh;
    items.push({
      type: 'news',
      title: pick.title,
      description: pick.summary,
      url: pick.link,
      source: srcLabel || pick.source,
      reason: `${srcLabel || pick.source} · ${pick.published ? pick.published.slice(0, 10) : ''}`,
      id: 'feed:' + pick.link,
    });
  };

  const pushGitHub = (idx) => {
    const repo = github.daily && github.daily[idx];
    if (!repo) return;
    const delta = repo.deltaVsSnapshot != null ? repo.deltaVsSnapshot : repo.delta;
    items.push({
      type: 'github',
      title: repo.fullName + ' 星标异动',
      description: repo.description || '',
      url: repo.url,
      source: 'GitHub Trending',
      reason: `GitHub Trending · ${fmtDelta(delta)} 星标`,
      id: 'repo:' + repo.fullName,
    });
  };

  const pushModel = (catKey, idx) => {
    const cat = models.categories && models.categories[catKey];
    const entry = cat && cat.entries[idx];
    if (!entry) return;
    const lbl = cat.label && cat.label.zh;
    items.push({
      type: 'model',
      title: entry.model + ' 榜单位置',
      description: `${lbl || catKey} · #${entry.rank} · ${entry.company && entry.company.zh || ''}`,
      url: entry.url,
      source: 'Artificial Analysis',
      reason: `Artificial Analysis · ${lbl || catKey} #${entry.rank}`,
      id: 'model:' + entry.model,
    });
  };

  // The day's 5-ish stories (mirrors the original digest mix)
  pushNews(['vscode', 'openai', 'githubblog', 'githubchangelog']);
  pushGitHub(0);
  pushModel('intelligence', 0);
  pushNews(['simonwillison', 'latentspace', 'vercel', 'huggingface'], true);
  pushGitHub(1);
  pushModel('coding_agent', 0);
  pushNews([], true);
  pushGitHub(2);

  return {
    date: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    items,
  };
}

module.exports = { buildDigest };
