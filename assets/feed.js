/* feed.js — 资讯时间线 page */
(function () {
  'use strict';

  let data = null;
  let filter = 'all';

  async function render() {
    const T = window.Trendkiln;
    const root = T.qs('#feed-root');
    if (!root) return;
    root.innerHTML = `<div class="loading">${T.t('noData')}…</div>`;

    try {
      if (!data) data = await T.loadJSON(T.BASE + 'data/feed.json');
      const zh = T.LS.get('lang', 'zh') === 'zh';

      T.qs('#page-title').textContent = T.t('feedTitle');
      T.qs('#page-sub').innerHTML = `${T.esc(T.t('feed_timeline'))} · <span class="meta">${T.t('generated')} ${T.esc(T.fmtDate(data.generatedAt))}</span>`;

      const ft = T.qs('#feed-tabs');
      ft.innerHTML = [
        ['all', T.t('feed_all')],
        ['unread', T.t('feed_unread')],
        ['readlater', T.t('feed_readlater')],
      ].map(([k, label]) => `<button class="tab ${k === filter ? 'active' : ''}" data-filter="${k}">${label}</button>`).join('');
      T.qsa('[data-filter]', ft).forEach((b) => b.addEventListener('click', () => {
        filter = b.dataset.filter;
        render();
      }));

      const all = data.items || [];
      const readSet = new Set(T.LS.get('read', []));
      const laterSet = new Set(T.LS.get('readlater', []));
      let items = all;
      if (filter === 'unread') items = all.filter((it) => !readSet.has(it.link));
      if (filter === 'readlater') items = all.filter((it) => laterSet.has(it.link));

      if (!items.length) {
        root.innerHTML = `<div class="empty">${T.t('noData')}</div>`;
        return;
      }

      root.innerHTML = items.map((it) => {
        const read = readSet.has(it.link);
        const later = laterSet.has(it.link);
        const followId = 'feed:' + it.link;
        const followed = T.isFollowed(followId);
        const srcLabel = it.sourceLabel && (zh ? it.sourceLabel.zh : it.sourceLabel.en);
        const readBtn = read
          ? `<button class="btn small" data-action="read" data-id="${T.esc(it.link)}">${T.t('markUnread')}</button>`
          : `<button class="btn small" data-action="read" data-id="${T.esc(it.link)}">${T.t('markRead')}</button>`;
        const laterBtn = later
          ? `<button class="btn small toggled" data-action="readlater" data-id="${T.esc(it.link)}">${T.t('readLater')} ✓</button>`
          : `<button class="btn small" data-action="readlater" data-id="${T.esc(it.link)}">${T.t('readLater')}</button>`;
        const followBtn = followed
          ? `<button class="btn small toggled" data-action="follow" data-id="${T.esc(followId)}" data-label="${T.esc(it.title)}">${T.t('following')}</button>`
          : `<button class="btn small" data-action="follow" data-id="${T.esc(followId)}" data-label="${T.esc(it.title)}">${T.t('follow')}</button>`;

        return `<div class="card feed-item ${read ? 'read' : 'unread'}">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="feed-source">${T.esc(srcLabel || it.source)}</span>
              <span class="feed-date">${T.esc(T.fmtDateTime(it.published))}</span>
            </div>
            <h2 class="feed-title"><a href="${T.esc(it.link)}" target="_blank" rel="noopener">${T.esc(it.title)}</a></h2>
            ${it.summary ? `<p class="feed-summary">${T.esc(it.summary)}</p>` : ''}
            <div class="feed-actions">${readBtn}${laterBtn}${followBtn}</div>
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
