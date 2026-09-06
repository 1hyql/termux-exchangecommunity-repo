/* 首页入口：状态检测、命令复制、UI 交互 */
(function () {
  'use strict';

  var PKG_FILE = 'packages.json';
  var STATUS_URL = 'dists/termux/InRelease';
  var SOURCE_NAME = 'Termux Exchange Community Repo';

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

    if (topNav) {
      window.addEventListener('scroll', function () { window.scrollY > 50 ? topNav.classList.add('scrolled') : topNav.classList.remove('scrolled'); });
    }
    // 本页锚点平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = this.getAttribute('href');
        if (!t || t === '#') return;
        var el = document.querySelector(t);
        if (el) {
          e.preventDefault();
          var h = topNav ? topNav.offsetHeight : 60;
          window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - h - 14, behavior: 'smooth' });
          closeMenuFn();
        }
      });
    });

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

  /* 命令复制按钮（通用） */
  function bindCopyButtons() {
    $('[data-copy-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var box = btn.closest('.codebox');
        var text = box && box.getAttribute('data-copytext');
        if (!text) return;
        copyText(text).then(function () {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          showToast('命令已复制');
          setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('copied'); }, 1800);
        });
      });
    });
  }

  /* 源状态检测 */
  function checkStatus() {
    var sourceStatus = document.getElementById('sourceStatus');
    var sourceNameEl = document.getElementById('sourceName');
    var reachableEl = document.getElementById('reachable');

    function setStatus(state, text) {
      if (sourceStatus) {
        sourceStatus.hidden = false;
        sourceStatus.classList.remove('hidden');
        sourceStatus.setAttribute('data-state', state);
        sourceStatus.innerHTML = '<span class="pulse-dot"></span>' + text;
      }
    }

    if (sourceNameEl) sourceNameEl.textContent = SOURCE_NAME;
    setStatus('loading', '检测中…');
    fetch(STATUS_URL + '?t=' + Date.now())
      .then(function (r) {
        if (r.ok) throw new Error('nosig');
        else throw new Error('HTTP ' + r.status);
      })
      .catch(function (e) {
        if (e.message === 'nosig') {
          setStatus('ok', '在线'); if (reachableEl) reachableEl.textContent = '在线 · 正常';
        } else {
          fetch(STATUS_URL, { method: 'GET', cache: 'no-store' })
            .then(function (r2) {
              if (r2.ok) { setStatus('ok', '在线'); if (reachableEl) reachableEl.textContent = '在线 · 正常'; }
              else { setStatus('err', '不可访问'); if (reachableEl) reachableEl.textContent = '不可访问'; }
            })
            .catch(function () {
              setStatus('err', '不可访问'); if (reachableEl) reachableEl.textContent = '不可访问';
            });
        }
      });
  }

  /* 加载 */
  function load() {
    initUI();

    var pkgTotalEl = document.getElementById('pkgTotal');
    var updatedAtEl = document.getElementById('updatedAt');
    if (pkgTotalEl) pkgTotalEl.textContent = '…';

    fetch(PKG_FILE + '?t=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var pkgs = data.packages || [];
        if (pkgTotalEl) pkgTotalEl.textContent = pkgs.length;
        if (updatedAtEl) updatedAtEl.textContent = data.updated_at ? new Date(data.updated_at).toLocaleString('zh-CN') : '—';
      })
      .catch(function () {
        if (pkgTotalEl) pkgTotalEl.textContent = '—';
        if (updatedAtEl) updatedAtEl.textContent = '—';
      });

    checkStatus();
    bindCopyButtons();
  }

  load();
})();