/* watchlist.js — 我的关注 page */
(function () {
  'use strict';

  let githubData = null;
  let modelsData = null;
  let feedData = null;

  function inferType(id) {
    if (id.indexOf('model:') === 0) return 'model';
    if (id.indexOf('kw:') === 0) return 'keyword';
    if (id.indexOf('feed:') === 0) return 'feed';
    return 'repo';
  }

  function signalFor(item, T) {
    const type = item.type || inferType(item.id);
    const zh = T.LS.get('lang', 'zh') === 'zh';
    if (type === 'repo') {
      const name = item.id;
      const periods = ['daily', 'weekly', 'monthly'];
      let hit = null;
      for (const p of periods) {
        const r = (githubData && githubData[p] || []).find((x) => x.fullName === name);
        if (r) { hit = r; break; }
      }
      if (!hit) return zh ? '暂无近期信号' : 'No recent signal';
      const d = hit.deltaVsSnapshot != null ? hit.deltaVsSnapshot : hit.delta;
      return `★ ${T.fmtNum(hit.stars)} · ${d != null ? T.fmtDelta(d) + ' ★' : ''} · #${hit.rank}`.replace(' ·  ·', ' ·');
    }
    if (type === 'model') {
      const name = item.id.replace(/^model:/, '');
      for (const k of Object.keys(modelsData.categories || {})) {
        const e = (modelsData.categories[k].entries || []).find((x) => x.model === name);
        if (e) {
          const lbl = zh ? modelsData.categories[k].label.zh : modelsData.categories[k].label.en;
          return `${lbl} #${e.rank} · ${e.score}`;
        }
      }
      return zh ? '暂无近期信号' : 'No recent signal';
    }
    if (type === 'feed') {
      const link = item.id.replace(/^feed:/, '');
      const it = (feedData && feedData.items || []).find((x) => x.link === link);
      if (!it) return zh ? '暂无近期信号' : 'No recent signal';
      return `${it.title} · ${T.fmtDate(it.published)}`;
    }
    // keyword
    const kw = item.id.replace(/^kw:/, '').toLowerCase();
    if (!kw) return '';
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const matches = (feedData && feedData.items || [])
      .filter((it) => {
        if (it.published && +new Date(it.published) < cutoff) return false;
        return (it.title || '').toLowerCase().includes(kw) || (it.summary || '').toLowerCase().includes(kw);
      })
      .slice(0, 3);
    if (!matches.length) return zh ? '近期无匹配' : 'No recent match';
    const titles = matches.map((m) => m.title.length > 34 ? m.title.slice(0, 33) + '…' : m.title).join(' · ');
    return `${zh ? '近期信号:' : 'Recent:'} ${titles}`;
  }

  async function loadData() {
    const T = window.Trendkiln;
    const tasks = [
      T.loadJSON(T.BASE + 'data/github.json').then((d) => { githubData = d; }).catch(() => {}),
      T.loadJSON(T.BASE + 'data/models.json').then((d) => { modelsData = d; }).catch(() => {}),
      T.loadJSON(T.BASE + 'data/feed.json').then((d) => { feedData = d; }).catch(() => {}),
    ];
    await Promise.all(tasks);
  }

  async function render() {
    const T = window.Trendkiln;
    const root = T.qs('#watch-root');
    if (!root) return;
    root.innerHTML = `<div class="loading">${T.t('noData')}…</div>`;
    await loadData();

    T.qs('#page-title').textContent = T.t('watchTitle');
    T.qs('#page-sub').textContent = T.t('watchHint');
    const addBtn = T.qs('#watch-add');
    addBtn.textContent = T.t('watchlist_add');
    T.qs('#watch-input').placeholder = T.LS.get('lang', 'zh') === 'zh' ? 'owner/repo · 模型名 · 关键词' : 'owner/repo · model name · keyword';

    const list = T.LS.get('watchlist', []);
    if (!list.length) {
      root.innerHTML = `<div class="empty">${T.t('watchlist_empty')}</div>`;
      return;
    }

    root.innerHTML = list.map((item) => {
      const type = item.type || inferType(item.id);
      const zh = T.LS.get('lang', 'zh') === 'zh';
      const typeLabel = { repo: 'repo', model: 'model', keyword: 'keyword', feed: 'feed' }[type];
      const target = type === 'keyword' ? item.label : (type === 'feed' ? (item.label || item.id) : item.id.replace(/^(model:|kw:|feed:)/, ''));
      const signal = signalFor(item, T);
      return `<div class="card watch-item">
        <span class="watch-type ${type}">${typeLabel}</span>
        <div style="flex:1;min-width:0;">
          <p class="watch-target">${T.esc(target)}</p>
          ${signal ? `<p class="watch-signal">${T.esc(signal)}</p>` : ''}
        </div>
        <button class="btn small danger" data-action="unwatch" data-id="${T.esc(item.id)}">${T.t('remove')}</button>
      </div>`;
    }).join('');

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="unwatch"]');
      if (!btn) return;
      const id = btn.dataset.id;
      let w = T.LS.get('watchlist', []);
      w = w.filter((x) => x.id !== id);
      T.LS.set('watchlist', w);
      let f = T.LS.get('followed', []);
      const fi = f.indexOf(id);
      if (fi >= 0) { f.splice(fi, 1); T.LS.set('followed', f); }
      T.toast(T.t('toast_removed'));
      render();
    });
  }

  function setupForm() {
    const T = window.Trendkiln;
    const form = T.qs('#watch-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = T.qs('#watch-type').value;
      const raw = T.qs('#watch-input').value.trim();
      if (!raw) return;
      let id, label;
      if (type === 'repo') { id = raw; label = raw; }
      else if (type === 'model') { id = 'model:' + raw; label = raw; }
      else { id = 'kw:' + raw; label = raw; }
      const list = T.LS.get('watchlist', []);
      if (!list.some((x) => x.id === id)) {
        list.push({ type, id, label });
        T.LS.set('watchlist', list);
      }
      T.qs('#watch-input').value = '';
      T.toast(T.t('toast_saved'));
      render();
    });
  }

  window.renderPage = render;
  function boot() { setupForm(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
