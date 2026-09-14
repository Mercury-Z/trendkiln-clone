// github.js — scrape GitHub Trending (daily / weekly / monthly).
'use strict';

const { fetchText } = require('./http');

const PERIODS = [
  { key: 'daily', label: 'today', since: 'daily' },
  { key: 'weekly', label: 'this week', since: 'weekly' },
  { key: 'monthly', label: 'this month', since: 'monthly' },
];

function decodeEntities(s) {
  return (s || '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNum(s) {
  if (!s) return 0;
  return parseInt(String(s).replace(/[^\d-]/g, ''), 10) || 0;
}

/**
 * Parse one <article class="Box-row">…</article> block.
 */
function parseRepoBlock(block, periodLabel) {
  const mName = block.match(/<a[^>]*href="\/([A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+)"[^>]*data-view-component="true" class="Link"/);
  if (!mName) return null;
  const fullName = mName[1];
  const owner = fullName.split('/')[0];
  const repo = fullName.split('/')[1];

  // description
  const mDesc = block.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  let description = '';
  if (mDesc) {
    description = decodeEntities(
      mDesc[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  // language
  const mLang = block.match(/<span itemprop="programmingLanguage">([^<]+)<\/span>/);
  const language = mLang ? decodeEntities(mLang[1]) : null;

  // stars total (link to /stargazers); the number sits after the svg icon
  const mStars = block.match(new RegExp(
    '<a[^>]*href="/' + fullName.replace('/', '\\/') + '/stargazers"[^>]*>[\\s\\S]*?([\\d,]+)\\s*<\\/a>'
  ));
  const stars = mStars ? parseNum(mStars[1]) : 0;

  const topics = []; // filled later via GitHub API (enrichTopics)

  // delta for this period
  const mDelta = block.match(new RegExp(
    '([+−\\-]?\\s?[\\d,]+)\\s+stars?\\s+' + periodLabel + '\\b'
  ));
  const delta = mDelta ? parseNum(mDelta[1]) : 0;

  return {
    rank: 0,
    fullName,
    owner,
    repo,
    url: 'https://github.com/' + fullName,
    stars,
    delta,
    language,
    topics: topics.slice(0, 6),
    description,
  };
}

/**
 * Scrape one trending page.
 * @param {'daily'|'weekly'|'monthly'} periodKey
 */
async function scrapeTrending(periodKey) {
  const period = PERIODS.find((p) => p.key === periodKey);
  if (!period) throw new Error('unknown period ' + periodKey);
  const { status, text } = await fetchText(
    'https://github.com/trending?since=' + period.since,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (status !== 200) throw new Error('trending status ' + status);

  const blocks = text.split('<article class="Box-row"').slice(1);
  const repos = [];
  for (const raw of blocks) {
    const block = raw.substring(0, raw.indexOf('</article>'));
    const repo = parseRepoBlock(block, period.label);
    if (repo) repos.push(repo);
  }
  return repos;
}

async function scrapeAllPeriods() {
  const out = {};
  for (const p of PERIODS) {
    const repos = await scrapeTrending(p.key);
    repos.forEach((r, i) => {
      r.rank = i + 1;
    });
    out[p.key] = repos;
    console.log(`  [github] ${p.key}: ${repos.length} repos`);
  }
  return out;
}

/**
 * Best-effort topic enrichment via the GitHub REST API.
 * `token` may be undefined (local runs) — then unauthenticated limits apply
 * and failures are silently skipped.
 */
async function enrichTopics(allPeriods, token) {
  const unique = new Map();
  for (const key of Object.keys(allPeriods)) {
    for (const r of allPeriods[key]) {
      if (!unique.has(r.fullName)) unique.set(r.fullName, r);
    }
  }
  const names = [...unique.keys()];
  console.log(`  [github] enriching topics for ${names.length} unique repos`);
  let ok = 0;
  let skipped = 0;
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const headers = {
      Accept: 'application/vnd.github+json',
    };
    if (token) headers.Authorization = 'Bearer ' + token;
    try {
      const res = await fetch('https://api.github.com/repos/' + name + '/topics', { headers });
      if (res.status === 403) {
        console.log('  [github] rate-limited, skipping remaining topics');
        break;
      }
      if (!res.ok) {
        skipped++;
        continue;
      }
      const data = await res.json();
      const topics = (data.names || []).slice(0, 6);
      for (const key of Object.keys(allPeriods)) {
        const match = allPeriods[key].find((r) => r.fullName === name);
        if (match) match.topics = topics;
      }
      ok++;
    } catch {
      skipped++;
    }
    // be gentle with the unauthenticated 60/hr limit
    if (!token && i % 10 === 9) await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(`  [github] topics enriched: ${ok}, skipped: ${skipped}`);
  return allPeriods;
}

module.exports = { scrapeTrending, scrapeAllPeriods, enrichTopics, PERIODS, parseNum, decodeEntities };
