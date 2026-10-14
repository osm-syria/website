/* Every page: clean URLs online, the compact sticky header, and keeping the reading position when switching language. */
(function () {
  'use strict';

  // Links name index.html so the site also works opened from disk. When it is served
  // over the web, drop that file name from internal links and from the address bar.
  if (/^https?:$/.test(location.protocol)) {
    var INDEX = /(^|\/)index\.html(?=$|[?#])/;
    Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (link) {
      var href = link.getAttribute('href');
      if (/^([a-z]+:|\/\/|#)/i.test(href) || !INDEX.test(href)) return;
      link.setAttribute('href', href.replace(INDEX, '$1') || './');
    });
    if (INDEX.test(location.pathname)) {
      history.replaceState(history.state, '', location.pathname.replace(INDEX, '$1') + location.search + location.hash);
    }
  }

  // Links marked data-embed open in a popup with the page in an iframe, instead of a new tab.
  // Without this script they still work as normal links.
  var embedLinks = document.querySelectorAll('a[data-embed]');
  if (embedLinks.length && window.HTMLDialogElement) {
    var ar = document.documentElement.lang === 'ar';
    var dialog = document.createElement('dialog');
    dialog.className = 'embed-dialog';
    dialog.innerHTML =
      '<div class="embed-bar">' +
        '<h2 class="embed-title"></h2>' +
        '<a class="embed-out" target="_blank" rel="noopener">' + (ar ? 'افتح في تبويب جديد' : 'Open in a new tab') + '</a>' +
        '<button type="button" class="embed-close" autofocus aria-label="' + (ar ? 'إغلاق' : 'Close') + '">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="embed-frame" data-loading="' + (ar ? 'جارٍ التحميل…' : 'Loading…') + '"><iframe allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>';
    document.body.appendChild(dialog);

    var frame = dialog.querySelector('iframe');
    var title = dialog.querySelector('.embed-title');
    var out = dialog.querySelector('.embed-out');

    Array.prototype.forEach.call(embedLinks, function (link) {
      link.addEventListener('click', function (event) {
        // Let ctrl/cmd/shift/middle clicks open the page normally
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        title.textContent = link.getAttribute('data-embed') || link.textContent.trim();
        frame.title = title.textContent;
        frame.src = link.href;
        out.href = link.href;
        dialog.showModal();
        document.documentElement.classList.add('has-dialog');
      });
    });

    dialog.querySelector('.embed-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();   // a click on the backdrop
    });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('has-dialog');
      frame.removeAttribute('src');                   // stop the embedded page
    });
  }

  var header = document.querySelector('.site-header');
  if (!header) return;

  // Compact header once the page has scrolled. The two thresholds stop it
  // flickering when the header's own shrink nudges the scroll position.
  var compact = false;

  function setCompact(next) {
    if (next === compact) return;
    compact = next;
    header.classList.toggle('is-compact', compact);
  }

  function update() {
    setCompact(compact ? window.scrollY > 16 : window.scrollY > 64);
  }

  // Language switch: both versions of a page have the same sections in the same
  // order, so remember which section is under the header and how far into it,
  // then restore that spot on the other page (its text may be longer or shorter).
  var KEY = 'osm-syria:lang-scroll';
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));

  function readingPoint() {
    var line = header.getBoundingClientRect().bottom;
    for (var i = 0; i < sections.length; i++) {
      var box = sections[i].getBoundingClientRect();
      if (box.bottom > line) return { i: i, f: Math.max(0, (line - box.top) / box.height) };
    }
    return null;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('.lang-switch');
    if (!link || window.scrollY < 1) return;
    var point = readingPoint();
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        to: link.href,
        at: Date.now(),
        i: point ? point.i : -1,
        f: point ? point.f : 0,
        page: window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      }));
    } catch (e) { /* storage blocked: the other page simply opens at the top */ }
  });

  function restore() {
    var saved;
    try {
      saved = JSON.parse(sessionStorage.getItem(KEY));
      sessionStorage.removeItem(KEY);
    } catch (e) { return; }
    if (!saved || saved.to !== location.href || Date.now() - saved.at > 30000) return;

    function go() {
      var section = sections[saved.i];
      var top;
      if (section) {
        // Jump straight to the compact header so its final height is measured, not mid-animation.
        header.classList.add('no-anim');
        setCompact(true);
        var box = section.getBoundingClientRect();
        top = window.scrollY + box.top + box.height * saved.f - header.getBoundingClientRect().height;
      } else {
        top = saved.page * (document.documentElement.scrollHeight - window.innerHeight);
      }
      window.scrollTo(0, Math.max(0, top));
      requestAnimationFrame(function () { header.classList.remove('no-anim'); });
    }

    go();
    // Fonts and images can still change the layout; correct once they have loaded,
    // unless the reader has already started scrolling.
    var settled = window.scrollY;
    window.addEventListener('load', function () {
      if (Math.abs(window.scrollY - settled) < 2) go();
    }, { once: true });
  }

  restore();
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
