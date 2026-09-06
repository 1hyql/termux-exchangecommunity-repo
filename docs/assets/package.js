/* 软件包页入口：推荐/全部列表、跳转 search.html?q=、复制、UI 交互 */
(function () {
  'use strict';

  var PKG_FILE = 'packages.json';
  var SEARCH_URL = 'search.html';

  /* UI 交互 */
  function initUI() {
    var menuToggle = document.getElementById('menuToggle');
    var menu = document.getElementById('menu');
    var closeMenu = document.getElementById('closeMenu');
    var menuOverlay = document.getElementById('menuOverlay');
    var topNav = document.getElementById('topNav');
    var backToTop = document.getElementById('backToTop');

    function openMenu() { if (menu) menu.classList.add('active'); if (menuOverlay) menuOverlay.classList.add('active'); if (menuToggle) menuToggle.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeMenuFn() { if (menu) menu.classList.remove('active'); if (menuOverlay) menuOverlay.classList.remove('active'); if (menuToggle) menuToggle.classList.remove('active'); document.body.style.overflow = ''; }
    if (menuToggle) menuToggle.addEventListener('click', function () { menu && menu.classList.contains('active') ? closeMenuFn() : openMenu(); });
    if (closeMenu) closeMenu.addEventListener('click', closeMenuFn);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenuFn);

    if (topNav) window.addEventListener('scroll', function () { window.scrollY > 50 ? topNav.classList.add('scrolled') : topNav.classList.remove('scrolled'); });
    if (backToTop) {
      window.addEventListener('scroll', function () { window.scrollY > 420 ? backToTop.classList.add('visible') : backToTop.classList.remove('visible'); });
      backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    var targets = document.querySelectorAll('.card');
    if ('IntersectionObserver' in window && targets.length) {
      targets.forEach(function (el) { el.classList.add('will-animate'); });
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.remove('will-animate'); e.target.classList.add('animate-in'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      targets.forEach(function (el) { obs.observe(el); });
      // 兜底：1.5s 内未触发动画则强制显示，避免卡片因 observer 异常而透明
      setTimeout(function () {
        targets.forEach(function (el) {
          if (el.classList.contains('will-animate')) {
            el.classList.remove('will-animate');
            el.classList.add('animate-in');
          }
        });
      }, 1500);
    }
  }

  /* 工具 */
  function $(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function showToast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { t.classList.remove('show'); }, 1900);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; });
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      resolve(ok);
    });
  }

  /* 跳转到搜索页（URL 传参） */
  function goSearch() {
    var q = (document.getElementById('searchInput').value || '').trim();
    window.location.href = SEARCH_URL + '?q=' + encodeURIComponent(q);
  }

  /* 渲染推荐 */
  function renderRecommended(pkgs) {
    var rec = pkgs.filter(function (p) { return p.recommended; });
    var recSection = document.getElementById('recommendedSection');
    var recList = document.getElementById('recommendedList');
    if (!rec.length) { recSection.hidden = true; recList.innerHTML = ''; return; }
    recSection.hidden = false;
    recList.innerHTML = rec.map(function (p) {
      return '<article class="rec-card">' +
        '<div class="rname">' + esc(p.name) + '</div>' +
        '<div class="rmeta">v' + esc(p.version) + ' · ' + esc(p.architecture || '') + '</div>' +
        '<div class="rdesc">' + esc(p.description || '') + '</div>' +
        '<div class="install"><code>apt install ' + esc(p.name) + '</code></div>' +
        '</article>';
    }).join('');
  }

  /* 渲染全部软件包 */
  function renderAll(pkgs) {
    var pkgList = document.getElementById('pkgList');
    if (!pkgs.length) {
      pkgList.innerHTML = '<div class="empty-state"><strong>当前暂无软件包</strong></div>';
      return;
    }
    pkgList.innerHTML = pkgs.map(function (p) {
      var badges =
        '<span class="badge ver">v' + esc(p.version) + '</span>' +
        (p.recommended ? '<span class="badge rec">推荐</span>' : '');
      var meta = '<span>架构: ' + esc(p.architecture || '') + '</span>';
      if (p.section) meta += '<span>分类: ' + esc(p.section) + '</span>';
      meta += '<span>维护者: ' + esc(p.maintainer || '') + '</span>';
      if (p.homepage) meta += '<span><a href="' + esc(p.homepage) + '" target="_blank" rel="noopener noreferrer">主页 ↗</a></span>';
      return '<article class="pkg-card">' +
        '<div class="pkg-head">' +
          '<span class="pkg-name">' + esc(p.name) + '</span>' +
          '<span class="pkg-badges">' + badges + '</span>' +
        '</div>' +
        '<div class="pkg-meta">' + meta + '</div>' +
        '<div class="pkg-desc">' + esc(p.description || '') + '</div>' +
        '<div class="pkg-actions">' +
          '<code class="pkg-install">apt install ' + esc(p.name) + '</code>' +
          '<button type="button" class="btn mini" data-copy-install="apt install ' + esc(p.name) + '">' +
            '<span data-done>复制安装命令</span>' +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    $('[data-copy-install]', pkgList).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = btn.getAttribute('data-copy-install');
        copyText(cmd).then(function () {
          var d = btn.querySelector('[data-done]');
          if (d) { d.textContent = '已复制 ✓'; setTimeout(function () { d.textContent = '复制安装命令'; }, 1800); }
          showToast('安装命令已复制');
        });
      });
    });
  }

  /* 加载 */
  function load() {
    initUI();

    var pkgCountEl = document.getElementById('pkgCount');
    var searchInput = document.getElementById('searchInput');
    var searchBtn = document.getElementById('searchBtn');

    fetch(PKG_FILE + '?t=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var pkgs = data.packages || [];
        if (pkgCountEl) pkgCountEl.textContent = '共 ' + pkgs.length + ' 个软件包 · 输入关键词并点「搜索」跳转到搜索结果页';
        renderRecommended(pkgs);
        renderAll(pkgs);
      })
      .catch(function () {
        if (pkgCountEl) pkgCountEl.textContent = '';
        document.getElementById('pkgList').innerHTML = '<div class="error-state"><strong>软件包数据加载失败</strong>请稍后重试</div>';
        var recSection = document.getElementById('recommendedSection');
        if (recSection) recSection.hidden = true;
      });

    if (searchInput) {
      searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') goSearch(); });
    }
    if (searchBtn) searchBtn.addEventListener('click', goSearch);
  }

  load();
})();