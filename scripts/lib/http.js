// http.js — minimal fetch wrapper with timeout + retries + sensible headers.
'use strict';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36 TrendkilnCollector/1.0';

/**
 * Fetch text with timeout + retries.
 * @param {string} url
 * @param {object} [opts]
 * @returns {Promise<{status:number, text:string}>}
 */
async function fetchText(url, opts = {}) {
  const {
    timeoutMs = 20000,
    retries = 2,
    headers = {},
    method = 'GET',
    body,
  } = opts;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'User-Agent': UA, 'Accept': '*/*', ...headers },
        body,
        signal: ctrl.signal,
        redirect: 'follow',
      });
      const text = await res.text();
      return { status: res.status, text };
    } catch (err) {
      lastErr = err;
      await sleep(1200 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`fetch failed for ${url}: ${lastErr && lastErr.message}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { fetchText, sleep };
