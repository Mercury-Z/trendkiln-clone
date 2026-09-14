/* settings.js — 设置 page */
(function () {
  'use strict';

  function render() {
    const T = window.Trendkiln;
    const zh = T.LS.get('lang', 'zh') === 'zh';

    T.qs('#page-title').textContent = T.t('settingsTitle');
    T.qs('#page-sub').textContent = T.t('settingsSub');

    // language
    const lang = T.LS.get('lang', 'zh');
    T.qs('#settings-lang-block h3').textContent = T.t('settings_lang');
    T.qs('#lang-hint').textContent = T.t('settings_langHint');
    T.qsa('#lang-seg button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));

    // digest count
    T.qs('#digest-title').textContent = T.t('settings_digest');
    T.qs('#digest-label').textContent = T.t('settings_digest');
    T.qs('#digest-hint').textContent = T.t('settings_digestHint');
    T.qs('#digest-count').value = T.LS.get('digestCount', 5);

    // github layout
    T.qs('#layout-title').textContent = T.t('settings_githubLayout');
    T.qs('#layout-label').textContent = T.t('settings_githubLayout');
    T.qs('#layout-hint').textContent = T.t('settings_githubLayoutHint');
    const layout = T.LS.get('githubLayout', 'cards');
    T.qsa('#layout-seg button').forEach((b) => {
      b.textContent = T.t('layout_' + b.dataset.layout);
      b.classList.toggle('active', b.dataset.layout === layout);
    });

    // reset
    T.qs('#reset-title').textContent = T.t('settings_demo');
    T.qs('#reset-label').textContent = T.t('settings_reset');
    T.qs('#reset-hint').textContent = T.t('settings_resetHint');
    T.qs('#reset-btn').textContent = T.t('settings_resetBtn');
  }

  function setup() {
    const T = window.Trendkiln;
    T.qsa('#lang-seg button').forEach((b) =>
      b.addEventListener('click', () => { T.setLang(b.dataset.lang); })
    );
    T.qs('#digest-count').addEventListener('change', (e) => {
      let v = parseInt(e.target.value, 10);
      if (isNaN(v)) v = 5;
      v = Math.max(1, Math.min(20, v));
      T.LS.set('digestCount', v);
      e.target.value = v;
      T.toast(T.t('toast_saved'));
    });
    T.qsa('#layout-seg button').forEach((b) =>
      b.addEventListener('click', () => {
        T.LS.set('githubLayout', b.dataset.layout);
        render();
      })
    );
    T.qs('#reset-btn').addEventListener('click', () => {
      ['lang', 'digestCount', 'githubLayout', 'watchlist', 'followed', 'read', 'readlater'].forEach((k) => {
        try { localStorage.removeItem('tk.' + k); } catch {}
      });
      T.toast(T.t('toast_removed'));
      location.reload();
    });
    render();
  }

  window.renderPage = render;
  function boot() { setup(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
