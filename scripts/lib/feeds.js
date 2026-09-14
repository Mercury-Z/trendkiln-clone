// feeds.js — RSS 2.0 / Atom parsing (stdlib-only) + curated source list.
'use strict';

const { fetchText } = require('./http');

// Curated AI/coding news sources (bilingual labels for UI).
const FEED_SOURCES = [
  { key: 'vscode', label: { zh: 'VS Code Blog', en: 'VS Code Blog' }, url: 'https://code.visualstudio.com/feed.xml', priority: 'high' },
  { key: 'simonwillison', label: { zh: 'Simon Willison', en: 'Simon Willison' }, url: 'https://simonwillison.net/atom/everything/', priority: 'high' },
  { key: 'openai', label: { zh: 'OpenAI Blog', en: 'OpenAI Blog' }, url: 'https://openai.com/news/rss.xml', priority: 'high' },
  { key: 'githubblog', label: { zh: 'GitHub Blog', en: 'GitHub Blog' }, url: 'https://github.blog/feed/', priority: 'high' },
  { key: 'githubchangelog', label: { zh: 'GitHub Changelog', en: 'GitHub Changelog' }, url: 'https://github.blog/changelog/feed/', priority: 'high' },
  { key: 'latentspace', label: { zh: 'Latent Space', en: 'Latent Space' }, url: 'https://www.latent.space/feed', priority: 'medium' },
  { key: 'huggingface', label: { zh: 'Hugging Face Blog', en: 'Hugging Face Blog' }, url: 'https://huggingface.co/blog/feed.xml', priority: 'medium' },
  { key: 'vercel', label: { zh: 'Vercel Blog', en: 'Vercel Blog' }, url: 'https://vercel.com/blog/rss.xml', priority: 'medium' },
  { key: 'codex', label: { zh: 'openai/codex 发布', en: 'openai/codex releases' }, url: 'https://github.com/openai/codex/releases.atom', priority: 'low' },
];

const MAX_PER_SOURCE = 60; // cap each source's contribution
const MAX_TOTAL = 300; // global cap after merge

function stripCdata(s) {
  return (s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function decodeEntities(s) {
  return stripCdata(s || '')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(Number(n)); } catch { return ''; }
    });
}

function stripTags(s) {
  // decode entities FIRST (escaped HTML like &lt;p&gt; becomes <p>), then strip tags
  return decodeEntities(s || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(re, str) {
  const m = str.match(re);
  return m ? m[1].trim() : '';
}

function getText(el) {
  return el ? stripCdata(el).trim() : '';
}

/**
 * Parse Atom (<feed>…<entry>…) or RSS 2.0 (<rss>…<item>…).
 * @returns {Array<{title, link, id, summary, published}>}
 */
function parseXml(xmlText, source) {
  const text = xmlText || '';
  const isAtom = /<feed[\s>]/i.test(text);
  const items = [];

  if (isAtom) {
    const entryRe = /<entry[\s>][\s\S]*?<\/entry>/gi;
    let m;
    while ((m = entryRe.exec(text)) !== null) {
      const e = m[0];
      const title = getText(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, e));
      const link =
        getText(firstMatch(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*\/?>/i, e)) ||
        getText(firstMatch(/<link[^>]*href="([^"]+)"[^>]*\/?>/i, e));
      const id = getText(firstMatch(/<id[^>]*>([\s\S]*?)<\/id>/i, e)) || link;
      const published =
        getText(firstMatch(/<published[^>]*>([\s\S]*?)<\/published>/i, e)) ||
        getText(firstMatch(/<updated[^>]*>([\s\S]*?)<\/updated>/i, e));
      const summary =
        getText(firstMatch(/<summary[^>]*>([\s\S]*?)<\/summary>/i, e)) ||
        getText(firstMatch(/<content[^>]*>([\s\S]*?)<\/content>/i, e));
      items.push({ title, link, id, summary, published, source });
    }
  } else {
    // RSS 2.0
    const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
    let m;
    while ((m = itemRe.exec(text)) !== null) {
      const e = m[0];
      const title = getText(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, e));
      const link =
        getText(firstMatch(/<link[^>]*>([\s\S]*?)<\/link>/i, e)) ||
        getText(firstMatch(/<guid[^>]*>([\s\S]*?)<\/guid>/i, e));
      const id = getText(firstMatch(/<guid[^>]*>([\s\S]*?)<\/guid>/i, e)) || link;
      const published = getText(firstMatch(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i, e));
      const summary =
        getText(firstMatch(/<description[^>]*>([\s\S]*?)<\/description>/i, e)) ||
        getText(firstMatch(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i, e));
      items.push({ title, link, id, summary, published, source });
    }
  }
  return items;
}

async function fetchSource(src) {
  const { status, text } = await fetchText(src.url, {
    timeoutMs: 25000,
    retries: 1,
    headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
  });
  if (status !== 200) throw new Error('status ' + status);
  const raw = parseXml(text, src);
  const items = raw
    .map((it) => ({
      source: src.key,
      sourceLabel: src.label,
      priority: src.priority,
      title: stripTags(it.title),
      link: it.link,
      id: it.id || it.link,
      summary: truncate(stripTags(it.summary), 320),
      published: it.published ? new Date(it.published).toISOString() : null,
    }))
    .filter((it) => it.title && it.link)
    .sort((a, b) => {
      const ta = a.published ? +new Date(a.published) : 0;
      const tb = b.published ? +new Date(b.published) : 0;
      return tb - ta;
    })
    .slice(0, MAX_PER_SOURCE);
  return items;
}

function truncate(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}

/**
 * Collect & merge all feeds, dedupe by link, sort newest-first.
 */
async function collectFeeds() {
  const results = await Promise.allSettled(
    FEED_SOURCES.map((src) =>
      fetchSource(src).then((items) => ({ src, items })).catch((err) => ({ src, items: [], err }))
    )
  );

  const bySource = new Map();
  let total = 0;
  for (const r of results) {
    const val = r.status === 'fulfilled' ? r.value : r.reason;
    const src = val && val.src;
    const items = val && val.items ? val.items : [];
    if (src) bySource.set(src.key, items.length);
    total += items.length;
    if (val && val.err) console.log(`  [feed] ${val.src && val.src.key}: FAILED (${val.err.message})`);
    else console.log(`  [feed] ${src && src.key}: ${items.length} items`);
  }

  const seen = new Set();
  const merged = [];
  for (const r of results) {
    const val = r.status === 'fulfilled' ? r.value : null;
    if (!val || !val.items) continue;
    for (const it of val.items) {
      const key = it.link || it.id;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(it);
    }
  }
  merged.sort((a, b) => {
    const ta = a.published ? +new Date(a.published) : 0;
    const tb = b.published ? +new Date(b.published) : 0;
    return tb - ta;
  });
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 60; // keep ~60 days
  const filtered = merged
    .filter((it) => !it.published || +new Date(it.published) > cutoff)
    .slice(0, MAX_TOTAL);

  console.log(`  [feed] merged ${merged.length}, kept ${filtered.length} (recent ${filtered.length === merged.length ? 'all' : '60d'})`);
  return { bySource: Object.fromEntries(bySource), items: filtered };
}

module.exports = { FEED_SOURCES, collectFeeds, parseXml, stripTags };
