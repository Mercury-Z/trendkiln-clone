/* models.js — 模型能力榜 page */
(function () {
  'use strict';

  let data = null;
  let activeCat = 'intelligence';

  function rankDeltaHtml(e, T) {
    const cls = e.rankDelta;
    let label = '';
    if (cls === 'up') label = `↑${e.rankFrom != null && e.rankFrom - e.rank > 0 ? e.rankFrom - e.rank : ''}`;
    else if (cls === 'down') label = `↓${e.rankFrom != null ? e.rank - e.rankFrom : ''}`;
    else if (cls === 'same') label = '—';
    else if (cls === 'new') label = T.LS.get('lang', 'zh') === 'zh' ? '新' : 'NEW';
    return `<span class="rank-delta ${cls}">${T.esc(label)}</span>`;
  }

  function scoreFmt(cat, score) {
    if (cat.unit === '$') return '$' + score.toFixed(2);
    if (Number.isInteger(score)) return String(score);
    return String(score);
  }

  function renderBars(cat, T) {
    const entries = cat.entries.slice(0, 11);
    const scores = entries.map((e) => e.score);
    const max = Math.max.apply(null, scores);
    const min = Math.min.apply(null, scores);
    const bars = entries.map((e) => {
      let w;
      if (cat.higherIsBetter) w = (e.score / max) * 100;
      else w = max === min ? 100 : ((max - e.score) / (max - min)) * 100;
      return `<div class="model-bar-row">
        <div class="model-bar-name"><a href="${T.esc(e.url)}" target="_blank" rel="noopener" title="${T.esc(e.model)}">${T.esc(e.model)}</a></div>
        <div class="model-bar-track"><div class="model-bar-fill" style="width:${w.toFixed(1)}%"></div></div>
        <div class="model-bar-score">${T.esc(scoreFmt(cat, e.score))}<span class="unit">${cat.unit === '$' ? '' : ' ' + T.esc(cat.unit)}</span></div>
      </div>`;
    }).join('');

    // unique companies present in top 11
    const seen = new Set();
    const companies = entries
      .filter((e) => { if (seen.has(e.companyKey)) return false; seen.add(e.companyKey); return true; })
      .map((e) => `<span class="company-tag">${T.esc((e.company && (T.LS.get('lang', 'zh') === 'zh' ? e.company.zh : e.company.en)) || e.companyKey)}</span>`)
      .join('');

    return `<div class="card">
      <div class="models-note" style="margin-top:0;">${T.t('models_note')}</div>
      <div class="model-bars">${bars}</div>
      <div class="model-company-row">${companies}</div>
    </div>`;
  }

  function renderTable(cat, T) {
    return `<div class="table-wrap" style="margin-top:16px;"><table class="models-table">
      <thead><tr>
        <th>${T.t('rank')}</th>
        <th>${T.t('rankDelta')}</th>
        <th>${T.t('model')}</th>
        <th>${T.t('developer')}</th>
        <th class="r">${T.t('score')}</th>
        <th></th>
      </tr></thead>
      <tbody>
        ${cat.entries.map((e) => {
          const id = 'model:' + e.model;
          const followed = T.isFollowed(id);
          const btn = `<button class="btn small ${followed ? 'toggled' : ''}" data-action="follow" data-id="${T.esc(id)}" data-label="${T.esc(e.model)}">${T.esc(followed ? T.t('following') : T.t('follow'))}</button>`;
          const companyName = (e.company && (T.LS.get('lang', 'zh') === 'zh' ? e.company.zh : e.company.en)) || e.companyKey;
          return `<tr>
            <td class="num">${e.rank}</td>
            <td>${rankDeltaHtml(e, T)}</td>
            <td><a href="${T.esc(e.url)}" target="_blank" rel="noopener">${T.esc(e.model)}</a></td>
            <td>${T.esc(companyName)}</td>
            <td class="num r">${T.esc(scoreFmt(cat, e.score))}</td>
            <td>${btn}</td>
          </tr>`;
        }).join('')}
      </tbody></table></div>`;
  }

  async function render() {
    const T = window.Trendkiln;
    const root = T.qs('#models-root');
    if (!root) return;
    root.innerHTML = `<div class="loading">${T.t('noData')}…</div>`;

    try {
      if (!data) data = await T.loadJSON(T.BASE + 'data/models.json');
      const cat = data.categories[activeCat];
      if (!cat) { root.innerHTML = `<div class="empty">${T.t('noData')}</div>`; return; }

      T.qs('#page-title').textContent = T.t('modelsTitle');
      T.qs('#page-sub').innerHTML = `${T.esc(T.t('modelsSub'))} · <span class="meta">${T.t('generated')} ${T.esc(T.fmtDate(data.generatedAt))}</span>`;

      // category tabs
      const ct = T.qs('#cat-tabs');
      const zh = T.LS.get('lang', 'zh') === 'zh';
      ct.innerHTML = Object.keys(data.categories).map((k) =>
        `<button class="tab ${k === activeCat ? 'active' : ''}" data-cat="${k}">${T.esc(zh ? data.categories[k].label.zh : data.categories[k].label.en)}</button>`
      ).join('');
      T.qsa('[data-cat]', ct).forEach((b) => b.addEventListener('click', () => {
        activeCat = b.dataset.cat;
        render();
      }));

      const zhLabel = T.LS.get('lang', 'zh') === 'zh';
      root.innerHTML =
        `<div class="models-note">${T.esc(zhLabel ? cat.note.zh : cat.note.en)} · ${T.t('models_top')} 11 · <a href="${T.esc(cat.sourceUrl)}" target="_blank" rel="noopener">${T.t('models_more')}</a></div>` +
        renderBars(cat, T) +
        renderTable(cat, T);

      T.bindActions(root);
    } catch (e) {
      console.error(e);
      root.innerHTML = `<div class="error">${T.t('loadFailed')}</div>`;
    }
  }

  window.renderPage = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
