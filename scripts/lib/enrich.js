// enrich.js — heuristic 用途/优势/创新点 generation from repo metadata.
'use strict';

function sentences(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function truncate(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}

/**
 * @param {object} repo {description, language, topics}
 */
function enrichRepo(repo) {
  const desc = repo.description || '';
  const sents = sentences(desc);

  const strengths = [];
  if (repo.language) strengths.push(`Built with ${repo.language}`);
  if (repo.topics && repo.topics.length) {
    for (const t of repo.topics.slice(0, 4)) strengths.push(t);
  }
  if (sents.length > 1) strengths.push(truncate(sents[1], 80));

  const innovation = sents[0] ? truncate(sents[0], 90) : '';

  return {
    usage: truncate(desc, 220) || (repo.fullName ? `Open-source project: ${repo.fullName}` : ''),
    strengths: strengths.slice(0, 6),
    innovation: innovation || '',
  };
}

module.exports = { enrichRepo };
