// models.js — build models.json from the curated snapshot + history (rank deltas).
'use strict';

const path = require('path');
const { readJson, writeJson, DATA_DIR } = require('./store');

const CATEGORY_ORDER = ['intelligence', 'coding_agent', 'coding_cost', 'text_to_image', 'image_to_video'];

function slugifyModel(name) {
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build data/models.json from the snapshot and the stored history.
 * @param {object} history
 * @returns {{history: object, models: object}}
 */
function buildModels(history) {
  const snapshot = readJson('models_snapshot.json');
  if (!snapshot) throw new Error('missing data/models_snapshot.json');

  const companies = snapshot.companies;
  const cats = {};
  const now = new Date().toISOString();

  for (const key of CATEGORY_ORDER) {
    const cat = snapshot.categories[key];
    if (!cat) continue;
    const prevRanks = history.models && history.models[key] && history.models[key].byModel;
    const entries = cat.entries.map((e) => {
      const prev = prevRanks && prevRanks[e.model];
      let rankDelta = 'same';
      let rankFrom = null;
      if (prev == null) rankDelta = 'new';
      else if (e.rank < prev) { rankDelta = 'up'; rankFrom = prev; }
      else if (e.rank > prev) { rankDelta = 'down'; rankFrom = prev; }
      return {
        rank: e.rank,
        rankDelta,
        rankFrom,
        model: e.model,
        company: companies[e.company] ? companies[e.company] : { zh: e.company, en: e.company },
        companyKey: e.company,
        score: e.score,
        url: 'https://artificialanalysis.ai/models/' + slugifyModel(e.model),
      };
    });
    cats[key] = {
      label: cat.label,
      note: cat.note,
      unit: cat.unit,
      higherIsBetter: cat.higherIsBetter,
      sourceUrl: cat.sourceUrl,
      entries,
    };
    // update history
    history.models = history.models || {};
    history.models[key] = {
      ts: now,
      byModel: Object.fromEntries(cat.entries.map((e) => [e.model, e.rank])),
    };
  }

  const models = {
    generatedAt: now,
    sourceNote: snapshot.note,
    companies,
    categories: cats,
  };
  return { history, models };
}

module.exports = { buildModels, CATEGORY_ORDER };
