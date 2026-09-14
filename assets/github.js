/* github.js — GitHub 热度榜 page */
(function () {
  'use strict';

  let data = null;
  let activePeriod = 'daily';

  function deltaEl(repo, T) {
    const d = repo.deltaVsSnapshot != null ? repo.deltaVsSnapshot : repo.delta;
    if (d == null) return '';
    const cls = d >= 0 ? 'up' : 'down';
    return `<span class="delta ${cls}">${T.esc(T.fmtDelta(d))}</span>`;
  }

  function cardHtml(repo, i, T) {
    const followed = T.isFollowed(repo.fullName);
    const followBtn = `<button class="btn small ${followed ? 'toggled' : ''}" data-action="follow" data-id="${T.esc(repo.fullName)}" data-label="${T.esc(repo.fullName)}">${T.esc(followed ? T.t('following') : T.t('follow'))}</button>`;
    const sections = [];
    if (repo.usage) sections.push(`<div class="repo-section"><span class="lbl">${T.t('usedFor')}</span><span class="val">${T.esc(repo.usage)}</span></div>`);
    if (repo.strengths && repo.strengths.length) sections.push(`<div class="repo-section"><span class="lbl">${T.t('strengths')}</span><span class="val">${T.esc(repo.strengths.join(' · '))}</span></div>`);
    if (repo.innovation) sections.push(`<div class="repo-section"><span class="lbl">${T.t('innovation')}</span><span class="val">${T.esc(repo.innovation)}</span></div>`);
    const chips = [];
    if (repo.language) chips.push(`<span class="chip lang">${T.esc(repo.language)}</span>`);
    (repo.topics || []).forEach((tp) => chips.push(`<span class="chip">${T.esc(tp)}</span>`));

    return `<div class="card">
      <div class="repo-head">
        <div class="rank-badge ${i < 3 ? 'top' : ''}">${repo.rank}</div>
        <div style="flex:1;min-width:0;">
          <h2 class="repo-title"><a href="${T.esc(repo.url)}" target="_blank" rel="noopener">${T.esc(repo.fullName)}</a></h2>
          <div class="repo-stars">
            <span>★ ${T.fmtNum(repo.stars)}</span>
            ${deltaEl(repo, T)}
          </div>
        </div>
        <div>${followBtn}</div>
      </div>
      ${repo.description ? `<p class="repo-desc">${T.esc(repo.description)}</p>` : ''}
      ${sections.length ? `<div class="repo-sections">${sections.join('')}</div>` : ''}
      ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
    </div>`;
  }

  function tableHtml(repo, T) {
    const d = repo.deltaVsSnapshot != null ? repo.deltaVsSnapshot : repo.delta;
    const deltaCls = d != null ? (d >= 0 ? 'up' : 'down') : '';
    const followed = T.isFollowed(repo.fullName);
    const followBtn = `<button class="btn small ${followed ? 'toggled' : ''}" data-action="follow" data-id="${T.esc(repo.fullName)}" data-label="${T.esc(repo.fullName)}">${T.esc(followed ? T.t('following') : T.t('follow'))}</button>`;
    const chips = [];
    if (repo.language) chips.push(T.esc(repo.language));
    (repo.topics || []).slice(0, 3).forEach((tp) => chips.push(T.esc(tp)));
    return `<tr>
      <td class="num">${repo.rank}</td>
      <td>
        <div style="font-weight:700;"><a href="${T.esc(repo.url)}" target="_blank" rel="noopener">${T.esc(repo.fullName)}</a></div>
        ${repo.description ? `<div style="color:var(--text-2);font-size:12.5px;margin-top:2px;">${T.esc(repo.description)}</div>` : ''}
      </td>
      <td>${chips.length ? `<div class="chips" style="margin-top:0;">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>` : ''}</td>
      <td class="num">${T.fmtNum(repo.stars)}</td>
      <td><span class="delta ${deltaCls}">${d != null ? T.fmtDelta(d) : ''}</span></td>
      <td>${followBtn}</td>
    </tr>`;
  }

  async function render() {
    const T = window.Trendkiln;
    const root = T.qs('#repo-root');
    if (!root) return;
    root.innerHTML = `<div class="loading">${T.t('noData')}…</div>`;

    try {
      if (!data) data = await T.loadJSON(T.BASE + 'data/github.json');
      const layout = T.LS.get('githubLayout', 'cards');
      const repos = data[activePeriod] || [];

      T.qs('#page-title').textContent = T.t('githubTitle');
      T.qs('#page-sub').innerHTML = `${T.esc(T.t('githubSub'))} · <span class="meta">${T.t('generated')} ${T.esc(T.fmtDate(data.generatedAt))}</span>`;

      // period tabs
      const pt = T.qs('#period-tabs');
      pt.innerHTML = ['daily', 'weekly', 'monthly'].map((p) =>
        `<button class="tab ${p === activePeriod ? 'active' : ''}" data-period="${p}">${T.t('period_' + p)}</button>`
      ).join('');
      T.qsa('[data-period]', pt).forEach((b) => b.addEventListener('click', () => {
        activePeriod = b.dataset.period;
        render();
      }));

      // layout toggle
      T.qs('#github-toolbar').style.display = '';
      T.qsa('[data-layout]').forEach((b) => {
        b.textContent = T.t('layout_' + b.dataset.layout);
        b.classList.toggle('active', b.dataset.layout === layout);
        b.addEventListener('click', () => {
          T.LS.set('githubLayout', b.dataset.layout);
          render();
        });
      });

      if (!repos.length) {
        root.innerHTML = `<div class="empty">${T.t('noData')}</div>`;
        return;
      }

      if (layout === 'table') {
        root.innerHTML = `<div class="table-wrap"><table class="repo-table">
          <thead><tr>
            <th>#</th><th>${T.t('model')}</th><th>${T.t('watchlist_type')}</th><th>★</th><th>Δ</th><th></th>
          </tr></thead><tbody>${repos.map((r) => tableHtml(r, T)).join('')}</tbody></table></div>`;
      } else {
        root.innerHTML = repos.map((r, i) => cardHtml(r, i, T)).join('');
      }
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
