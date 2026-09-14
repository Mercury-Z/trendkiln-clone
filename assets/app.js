/* Trendkiln — shared runtime: i18n, local state, nav, helpers. */
(function () {
  'use strict';

  /* ---------------- i18n ---------------- */
  const I18N = {
    zh: {
      tagline: '每天十分钟，扫完 AI 编程该看什么',
      nav_today: '今日摘要',
      nav_github: 'GitHub 热度',
      nav_models: '模型榜',
      nav_feed: '资讯',
      nav_watchlist: '我的关注',
      nav_settings: '设置',
      readLater: '稍后读',
      follow: '关注',
      following: '已关注',
      remove: '移除',
      markRead: '标为已读',
      markUnread: '标为未读',
      type_github: 'GitHub 异动',
      type_model: '模型排名',
      type_news: '必读资讯',
      stars: '星标',
      usedFor: '用途',
      strengths: '优势',
      innovation: '创新点',
      followers: '关注',
      noData: '暂无数据，请稍后再来',
      loadFailed: '数据加载失败',
      toast_saved: '已保存',
      toast_removed: '已移除',
      toast_followed: '已加入关注',
      toast_unfollowed: '已取消关注',
      toast_read: '已标为已读',
      toast_unread: '已标为未读',
      toast_readlater_added: '已加入稍后读',
      toast_readlater_removed: '已从稍后读移除',
      generated: '数据更新于',
      period_daily: '天榜',
      period_weekly: '周榜',
      period_monthly: '月榜',
      layout_cards: '卡片列表',
      layout_table: '表格',
      models_note: '来自 Artificial Analysis 公开榜快照 · 点击柱或标签打开来源页',
      models_top: '展示前',
      models_more: '更多在 Artificial Analysis',
      rank: '名次',
      rankDelta: '名次 Δ',
      model: '模型',
      developer: '开发商',
      score: '分数',
      feed_all: '全部',
      feed_unread: '未读',
      feed_readlater: '稍后读',
      feed_timeline: '精选 RSS / 官方动态',
      watchlist_add: '目标添加关注',
      watchlist_type: '类型',
      watchlist_keyword: '关键词',
      watchlist_target: '目标',
      watchlist_recent: '近期信号',
      watchlist_empty: '还没有关注任何内容，使用上方的「目标添加关注」或页面上的「关注」按钮来钉住 repo / 模型 / 关键词。',
      watchlist_hint: '钉住 repo / 模型 / 关键词',
      settings_lang: '界面语言',
      settings_langHint: '中文 / English，保存在本机',
      settings_digest: '摘要条数',
      settings_digestHint: '首页今日摘要显示条数（默认 5）',
      settings_githubLayout: 'GitHub 默认布局',
      settings_githubLayoutHint: '与 /github 页布局切换共用 localStorage',
      settings_reset: '重置全部本地数据',
      settings_resetHint: '清除语言、关注、已读、稍后读等本机记录',
      settings_resetBtn: '重置',
      settings_demo: '演示数据',
      langLabel: '语言',
      backHome: '返回今日摘要',
      notFound: '页面不存在',
      homeTitle: '今日摘要',
      homeUpdated: '数据更新于',
      githubTitle: 'GitHub 热度榜',
      githubSub: '以 Trending 为主，展示相对快照增量',
      modelsTitle: '模型能力榜',
      modelsSub: '来自 Artificial Analysis 公开榜快照 · 越高越好',
      feedTitle: '资讯时间线',
      watchTitle: '我的关注',
      settingsTitle: '设置',
      settingsSub: '个人偏好（保存在本机）',
      watchHint: '钉住 repo / 模型 / 关键词',
      viewSource: '阅读全文',
    },
    en: {
      tagline: '10 minutes a day to scan what matters in AI coding',
      nav_today: 'Today',
      nav_github: 'GitHub',
      nav_models: 'Models',
      nav_feed: 'Feed',
      nav_watchlist: 'Watchlist',
      nav_settings: 'Settings',
      readLater: 'Read later',
      follow: 'Follow',
      following: 'Following',
      remove: 'Remove',
      markRead: 'Mark read',
      markUnread: 'Mark unread',
      type_github: 'GitHub Mover',
      type_model: 'Model Rank',
      type_news: 'Must-read',
      stars: 'stars',
      usedFor: 'Use',
      strengths: 'Highlights',
      innovation: 'Innovation',
      followers: 'Follow',
      noData: 'No data yet — come back soon',
      loadFailed: 'Failed to load data',
      toast_saved: 'Saved',
      toast_removed: 'Removed',
      toast_followed: 'Followed',
      toast_unfollowed: 'Unfollowed',
      toast_read: 'Marked read',
      toast_unread: 'Marked unread',
      toast_readlater_added: 'Added to read later',
      toast_readlater_removed: 'Removed from read later',
      generated: 'Data updated',
      period_daily: 'Daily',
      period_weekly: 'Weekly',
      period_monthly: 'Monthly',
      layout_cards: 'Cards',
      layout_table: 'Table',
      models_note: 'Snapshot from Artificial Analysis public leaderboard · click a bar or label to open the source',
      models_top: 'Top',
      models_more: 'More on Artificial Analysis',
      rank: 'Rank',
      rankDelta: 'Δ Rank',
      model: 'Model',
      developer: 'Developer',
      score: 'Score',
      feed_all: 'All',
      feed_unread: 'Unread',
      feed_readlater: 'Read later',
      feed_timeline: 'Curated RSS / official updates',
      watchlist_add: 'Add to watchlist',
      watchlist_type: 'Type',
      watchlist_keyword: 'Keyword',
      watchlist_target: 'Target',
      watchlist_recent: 'Recent signals',
      watchlist_empty: 'Nothing watched yet — pin repos / models / keywords with the form above or the Follow buttons on each page.',
      watchlist_hint: 'Pin repos / models / keywords',
      settings_lang: 'Language',
      settings_langHint: '中文 / English, stored locally',
      settings_digest: 'Digest items',
      settings_digestHint: 'Number of items on the home digest (default 5)',
      settings_githubLayout: 'Default GitHub layout',
      settings_githubLayoutHint: 'Shared localStorage with the /github layout toggle',
      settings_reset: 'Reset local data',
      settings_resetHint: 'Clear language, follows, read and read-later state stored on this device',
      settings_resetBtn: 'Reset',
      settings_demo: 'Demo data',
      langLabel: 'Language',
      backHome: 'Back to today',
      notFound: 'Page not found',
      homeTitle: 'Today’s Digest',
      homeUpdated: 'Data updated',
      githubTitle: 'GitHub Trending',
      githubSub: 'Trending first, with relative snapshot deltas',
      modelsTitle: 'Model Leaderboard',
      modelsSub: 'Snapshot from Artificial Analysis public leaderboard · higher is better',
      feedTitle: 'News Timeline',
      watchTitle: 'Watchlist',
      settingsTitle: 'Settings',
      settingsSub: 'Preferences (stored on this device)',
      watchHint: 'Pin repos / models / keywords',
      viewSource: 'Read the full article',
    },
  };

  /* ---------------- storage ---------------- */
  const LS = {
    get(k, def) {
      try {
        const v = localStorage.getItem('tk.' + k);
        return v == null ? def : JSON.parse(v);
      } catch { return def; }
    },
    set(k, v) {
      try { localStorage.setItem('tk.' + k, JSON.stringify(v)); } catch {}
    },
  };

  /* ---------------- state helpers ---------------- */
  function state() {
    return {
      lang: LS.get('lang', 'zh'),
      digestCount: LS.get('digestCount', 5),
      githubLayout: LS.get('githubLayout', 'cards'),
      watchlist: LS.get('watchlist', []),
      followed: LS.get('followed', []),
      read: LS.get('read', []),
      readlater: LS.get('readlater', []),
    };
  }

  function setLang(l) {
    LS.set('lang', l);
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    renderNav();
    renderFooter();
    document.title = 'Trendkiln — ' + (l === 'zh' ? I18N.zh.tagline : I18N.en.tagline);
    if (window.renderPage) window.renderPage();
  }

  /* ---------------- tiny helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtNum(n) {
    if (n == null) return '';
    return Number(n).toLocaleString('en-US');
  }
  function fmtDelta(n) {
    if (n == null) return '';
    return (n > 0 ? '+' : '') + fmtNum(n);
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }
  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    const ap = h >= 12 ? 'PM' : 'AM';
    const hh = ((h + 11) % 12) + 1;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}, ${hh}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ap}`;
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------- nav ---------------- */
  function renderNav() {
    const host = qs('#app-nav');
    if (!host) return;
    const l = LS.get('lang', 'zh');
    const d = I18N[l] || I18N.zh;
    const base = window.BASE || './';
    const links = [
      ['index.html', d.nav_today],
      ['github/', d.nav_github],
      ['models/', d.nav_models],
      ['feed/', d.nav_feed],
      ['watchlist/', d.nav_watchlist],
      ['settings/', d.nav_settings],
    ];
    const path = location.pathname.replace(/\/$/, '');
    const isHome = /\/index\.html?$/.test(path) || /\/$/.test(location.pathname) || /\/trendkiln/.test(location.pathname);
    host.innerHTML =
      `<div class="brand">
        <span class="brand-mark">🔥</span>
        <span class="brand-name"><a href="${base}index.html">Trendkiln</a></span>
        <span class="brand-tagline">${esc(d.tagline)}</span>
      </div>
      <div class="nav-links">
        ${links.map(([href, label]) => {
          let active = false;
          const h = (base + href).replace(/\/index\.html$/, '/').replace(/\/$/, '');
          if (href === 'index.html') active = isHome;
          else active = path.endsWith(h) || path.endsWith(href.replace(/\/$/, '')) || (href === 'github/' && /\/github/.test(path));
          return `<a href="${base}${href}" class="${active ? 'active' : ''}">${esc(label)}</a>`;
        }).join('')}
      </div>
      <div class="lang-switch">
        <button data-lang="zh" class="${l === 'zh' ? 'active' : ''}">中文</button>
        <button data-lang="en" class="${l === 'en' ? 'active' : ''}">English</button>
      </div>`;
    qsa('[data-lang]', host).forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  }

  /* ---------------- toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    let el = qs('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  /* ---------------- data loading ---------------- */
  const cache = {};
  async function loadJSON(url) {
    if (cache[url]) return cache[url];
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    cache[url] = j;
    return j;
  }

  /* ---------------- follow / readlater / read toggles ---------------- */
  function isFollowed(id) { return LS.get('followed', []).includes(id); }
  function toggleFollow(id, label) {
    let f = LS.get('followed', []);
    const watchlist = LS.get('watchlist', []);
    const idx = f.indexOf(id);
    if (idx >= 0) {
      f.splice(idx, 1);
      const w = watchlist.findIndex((x) => x.id === id);
      if (w >= 0) watchlist.splice(w, 1);
      toast(I18N[LS.get('lang', 'zh')].toast_unfollowed);
    } else {
      f.push(id);
      if (label && !watchlist.some((x) => x.id === id)) {
        watchlist.push({ id, label });
      }
      toast(I18N[LS.get('lang', 'zh')].toast_followed);
    }
    LS.set('followed', f);
    LS.set('watchlist', watchlist);
    return idx < 0;
  }
  function isReadLater(id) { return LS.get('readlater', []).includes(id); }
  function toggleReadLater(id) {
    let r = LS.get('readlater', []);
    const i = r.indexOf(id);
    if (i >= 0) { r.splice(i, 1); toast(I18N[LS.get('lang', 'zh')].toast_readlater_removed); }
    else { r.push(id); toast(I18N[LS.get('lang', 'zh')].toast_readlater_added); }
    LS.set('readlater', r);
    return i < 0;
  }
  function isRead(id) { return LS.get('read', []).includes(id); }
  function toggleRead(id) {
    let r = LS.get('read', []);
    const i = r.indexOf(id);
    if (i >= 0) { r.splice(i, 1); toast(I18N[LS.get('lang', 'zh')].toast_unread); }
    else { r.push(id); toast(I18N[LS.get('lang', 'zh')].toast_read); }
    LS.set('read', r);
    return i < 0;
  }

  function t(k) {
    const l = LS.get('lang', 'zh');
    return (I18N[l] && I18N[l][k]) || I18N.zh[k] || k;
  }

  /* ---------------- shared card buttons ---------------- */
  function actionBar(actions) {
    return '<div class="digest-actions">' + actions.map((a) =>
      `<button class="btn ${a.cls || ''}" data-action="${a.name}" data-id="${esc(a.id || '')}" ${a.attrs || ''}>${esc(a.label)}</button>`
    ).join('') + '</div>';
  }

  function bindActions(root) {
    root = root || document;
    qsa('[data-action]', root).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const el = e.currentTarget;
        const action = el.dataset.action;
        const id = el.dataset.id;
        if (action === 'follow') {
          const now = toggleFollow(id, el.dataset.label || id);
          el.classList.toggle('toggled', now);
          el.textContent = now ? t('following') : t('follow');
        } else if (action === 'readlater') {
          const now = toggleReadLater(id);
          el.classList.toggle('toggled', now);
          el.textContent = now ? t('readLater') + ' ✓' : t('readLater');
        } else if (action === 'read') {
          toggleRead(id);
          if (window.renderPage) window.renderPage();
        }
      });
    });
  }

  /* ---------------- footer ---------------- */
  function renderFooter() {
    const foot = qs('#footer');
    if (!foot) return;
    const zh = LS.get('lang', 'zh') === 'zh';
    foot.innerHTML =
      (zh
        ? `Trendkiln — 每天十分钟，扫完 AI 编程该看什么 · 数据来源：<a href="https://github.com/trending" target="_blank" rel="noopener">GitHub Trending</a> / <a href="https://artificialanalysis.ai/" target="_blank" rel="noopener">Artificial Analysis</a> / 各 RSS 源`
        : `Trendkiln — 10 minutes a day to scan what matters in AI coding · Sources: <a href="https://github.com/trending" target="_blank" rel="noopener">GitHub Trending</a> / <a href="https://artificialanalysis.ai/" target="_blank" rel="noopener">Artificial Analysis</a> / RSS`) +
      ' · <a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a>';
  }

  /* ---------------- init ---------------- */
  function init() {
    renderNav();
    renderFooter();
    document.documentElement.lang = LS.get('lang', 'zh') === 'zh' ? 'zh-CN' : 'en';
    document.title = 'Trendkiln — ' + t('tagline');
    // global click handler so dynamic content works after re-render
    bindActions(document);
  }

  window.Trendkiln = {
    BASE: window.BASE || './',
    I18N, LS, state, setLang, t,
    esc, fmtNum, fmtDelta, fmtDate, fmtDateTime,
    loadJSON, toast, init, renderNav, renderFooter,
    isFollowed, toggleFollow, isReadLater, toggleReadLater, isRead, toggleRead,
    qs, qsa, bindActions,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
