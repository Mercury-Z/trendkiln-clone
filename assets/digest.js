/* digest.js — home page: today's digest */
(function () {
  'use strict';

  function typeBadge(type, T) {
    const map = { github: 'github', model: 'model', news: 'news' };
    const cls = map[type] || 'news';
    const label = T.t('type_' + cls);
    return `<span class="type-badge ${cls}">${T.esc(label)}</span>`;
  }

  async function render() {
    const T = window.Trendkiln;
    const root = T.qs('#digest-list');
    if (!root) return;
    root.innerHTML = `<div class="loading">${T.t('noData')}…</div>`;

    try {
      const d = await T.loadJSON(T.BASE + 'data/digest.json');
      const items = (d.items || []).slice();
      const count = Math.max(1, T.LS.get('digestCount', 5));
      const shown = items.slice(0, count);

      const dateStr = d.date ? T.fmtDate(d.date + 'T12:00:00') : '';
      T.qs('#page-title').textContent = T.t('homeTitle');
      T.qs('#page-sub').innerHTML =
        (dateStr ? `<span class="meta">${T.esc(dateStr)}</span> · ` : '') +
        (T.LS.get('lang', 'zh') === 'zh' ? `今日 ${shown.length} 件事` : `${shown.length} stories today`) +
        (d.generatedAt ? ` · ${T.t('homeUpdated')} ${T.esc(T.fmtDate(d.generatedAt))}` : '');

      if (!shown.length) {
        root.innerHTML = `<div class="empty">${T.t('noData')}</div>`;
        return;
      }

      root.innerHTML = shown.map((it, i) => {
        const isLast = i === shown.length - 1;
        const readLaterBtn = T.isReadLater(it.id)
          ? `<button class="btn small toggled" data-action="readlater" data-id="${T.esc(it.id)}">${T.t('readLater')} ✓</button>`
          : `<button class="btn small" data-action="readlater" data-id="${T.esc(it.id)}">${T.t('readLater')}</button>`;
        return `<div class="card digest-item">
          <div class="digest-rail">
            <div class="digest-num">${i + 1}</div>
            ${isLast ? '' : '<div class="line"></div>'}
          </div>
          <div class="digest-main">
            <div class="digest-meta">
              ${typeBadge(it.type, T)}
              <span class="digest-reason">${T.esc(it.reason || '')}</span>
            </div>
            <h2 class="digest-title"><a href="${T.esc(it.url)}" target="_blank" rel="noopener">${T.esc(it.title)}</a></h2>
            ${it.description ? `<p class="digest-desc">${T.esc(it.description)}</p>` : ''}
            <div class="digest-actions">
              ${readLaterBtn}
            </div>
          </div>
        </div>`;
      }).join('');

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
