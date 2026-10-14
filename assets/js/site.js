/* Every page: the compact sticky header, and keeping the reading position when switching language. */
(function () {
  'use strict';

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
