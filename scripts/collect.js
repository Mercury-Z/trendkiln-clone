#!/usr/bin/env node
// collect.js — one-shot data collector for Trendkiln.
// Runs on a schedule (GitHub Actions) and writes data/*.json for the static site.
'use strict';

const { scrapeAllPeriods, enrichTopics } = require('./lib/github');
const { buildModels } = require('./lib/models');
const { collectFeeds } = require('./lib/feeds');
const { buildDigest } = require('./lib/digest');
const { enrichRepo } = require('./lib/enrich');
const { readJson, writeJson } = require('./lib/store');

async function main() {
  const started = Date.now();
  console.log('== Trendkiln collector ==');
  const history0 = readJson('history.json', {});
  let history = history0;
  history.updatedAt = new Date().toISOString();

  // 1) GitHub trending ------------------------------------------------
  let github = null;
  try {
    console.log('[1/4] GitHub Trending');
    github = await scrapeAllPeriods();
    const token = process.env.GITHUB_TOKEN || '';
    if (token) {
      await enrichTopics(github, token);
    } else {
      console.log('  [github] no GITHUB_TOKEN — skipping topic enrichment');
    }
    // heuristic summaries + snapshot deltas
    for (const periodKey of ['daily', 'weekly', 'monthly']) {
      const prev = history.github && history.github[periodKey] && history.github[periodKey].repos;
      const next = {};
      for (const r of github[periodKey]) {
        const enriched = enrichRepo(r);
        r.usage = enriched.usage;
        r.strengths = enriched.strengths;
        r.innovation = enriched.innovation;
        r.deltaVsSnapshot = prev && prev[r.fullName] != null ? r.stars - prev[r.fullName] : null;
        next[r.fullName] = r.stars;
      }
      history.github = history.github || {};
      history.github[periodKey] = { ts: new Date().toISOString(), repos: next };
    }
    writeJson('github.json', {
      generatedAt: new Date().toISOString(),
      periods: ['daily', 'weekly', 'monthly'],
      daily: github.daily,
      weekly: github.weekly,
      monthly: github.monthly,
    });
    console.log('  [github] wrote data/github.json');
  } catch (err) {
    console.error('  [github] FAILED:', err.message);
  }

  // 2) Models ---------------------------------------------------------
  let models = null;
  try {
    console.log('[2/4] Model leaderboards');
    const res = buildModels(history);
    history = res.history;
    models = res.models;
    writeJson('models.json', models);
    console.log('  [models] wrote data/models.json');
  } catch (err) {
    console.error('  [models] FAILED:', err.message);
  }

  // 3) Feeds ----------------------------------------------------------
  let feed = null;
  try {
    console.log('[3/4] RSS / Atom feeds');
    feed = await collectFeeds();
    writeJson('feed.json', {
      generatedAt: new Date().toISOString(),
      bySource: feed.bySource,
      items: feed.items,
    });
    console.log('  [feed] wrote data/feed.json');
  } catch (err) {
    console.error('  [feed] FAILED:', err.message);
  }

  // 4) Digest ---------------------------------------------------------
  try {
    console.log('[4/4] Daily digest');
    const githubData = readJson('github.json', null);
    const modelsData = readJson('models.json', null);
    const feedData = readJson('feed.json', null);
    if (githubData && modelsData && feedData) {
      const digest = buildDigest(githubData, modelsData, feedData);
      writeJson('digest.json', digest);
      console.log(`  [digest] ${digest.items.length} items -> data/digest.json`);
    } else {
      console.warn('  [digest] skipped (missing inputs)');
    }
  } catch (err) {
    console.error('  [digest] FAILED:', err.message);
  }

  writeJson('history.json', history);
  console.log(`== done in ${((Date.now() - started) / 1000).toFixed(1)}s ==`);
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});
