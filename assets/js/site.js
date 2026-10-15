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

  // On the demo deployment (demo.openstreetmap.sy) only: a banner saying this is a demo,
  // linking to the official site in the same tab.
  if (/^demo\./i.test(location.hostname)) {
    var arD = document.documentElement.lang === 'ar';
    var banner = document.createElement('aside');
    banner.className = 'demo-banner';
    banner.setAttribute('aria-label', arD ? 'نسخة تجريبية' : 'Demo version');
    banner.innerHTML = arD
      ? '<span>هذه نسخة تجريبية من الموقع. الموقع الرسمي للمجتمع هو <b dir="ltr">openstreetmap.sy</b></span><a href="https://openstreetmap.sy/">انتقل إلى الموقع الرسمي</a>'
      : '<span>This is a demo version of the website. The official community website is <b>openstreetmap.sy</b></span><a href="https://openstreetmap.sy/">Go to the official website</a>';
    var skip = document.querySelector('.skip-link');
    document.body.insertBefore(banner, skip ? skip.nextSibling : document.body.firstChild);
  }

  // Footer: copyright year, and the date of the latest change to the branch this site is
  // published from (develop for the demo, main for the official site), read from GitHub's API.
  Array.prototype.forEach.call(document.querySelectorAll('[data-copyright-year]'), function (node) {
    var year = new Date().getFullYear();
    if (year > +node.textContent) node.textContent = year;
  });

  var updated = document.querySelector('.last-update');
  if (updated && /^https?:$/.test(location.protocol)) {
    var branch = /^demo\./i.test(location.hostname) ? 'develop' : 'main';
    var CACHE = 'osm-syria:last-update:' + branch;
    var showDate = function (iso) {
      var date = new Date(iso);
      if (isNaN(date)) return;
      var arU = document.documentElement.lang === 'ar';
      var months = arU
        ? ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var time = updated.querySelector('time');
      time.setAttribute('datetime', iso);
      time.textContent = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
      updated.querySelector('a').href = 'https://github.com/osm-syria/website/commits/' + branch + '/';
      updated.hidden = false;
    };
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE)); } catch (e) { /* storage blocked */ }
    if (cached && Date.now() - cached.at < 3600000) {
      showDate(cached.date);
    } else if (window.fetch) {
      fetch('https://api.github.com/repos/osm-syria/website/commits?sha=' + branch + '&per_page=1', { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { if (!r.ok) throw r; return r.json(); })
        .then(function (commits) {
          var iso = commits[0].commit.committer.date;
          try { localStorage.setItem(CACHE, JSON.stringify({ date: iso, at: Date.now() })); } catch (e) { /* storage blocked */ }
          showDate(iso);
        })
        .catch(function () { if (cached) showDate(cached.date); });   // offline or rate-limited: an older date beats none
    }
  }

  // Visit statistics with Google Analytics, only after the visitor accepts.
  // Paste the GA4 Measurement ID below (it looks like G-XXXXXXXXXX). Until then, and on any
  // domain other than openstreetmap.sy (the demo, local copies), nothing loads and no banner shows.
  var GA_ID = 'G-0JK1E7B6K9';
  var CONSENT = 'osm-syria:analytics';
  var analyticsOn = /^G-[A-Z0-9]+$/.test(GA_ID) && /^(www\.)?openstreetmap\.sy$/i.test(location.hostname);
  var arA = document.documentElement.lang === 'ar';
  var readChoice = function () { try { return localStorage.getItem(CONSENT); } catch (e) { return null; } };
  var saveChoice = function (v) { try { if (v) localStorage.setItem(CONSENT, v); else localStorage.removeItem(CONSENT); } catch (e) { /* storage blocked */ } };

  function loadAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // Statistics only: nothing for advertising
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 180 * 24 * 3600 });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(tag);
  }

  function askConsent() {
    var privacy = (arA ? '' : 'en/');
    var root = document.querySelector('link[rel="manifest"]');   // its href leads back to the site root from any page
    var base = root ? root.getAttribute('href').replace(/site\.webmanifest$/, '') : '/';
    var bar = document.createElement('aside');
    bar.className = 'consent-bar';
    bar.setAttribute('aria-label', arA ? 'إحصاء الزيارات' : 'Visit statistics');
    bar.innerHTML =
      '<p>' + (arA
        ? 'نودّ إحصاء الزيارات عبر Google Analytics لتحسين الموقع. الإحصاء <b>مجهول الهوية</b>: لا نعرف أبداً من أنت، ولا يُجمع شيء ما لم توافق. <a href="' + base + 'privacy/">تفاصيل الخصوصية</a>'
        : 'We’d like to count visits with Google Analytics to improve this website. It’s <b>anonymous</b>: we never know who you are, and nothing is collected unless you accept. <a href="' + base + privacy + 'privacy/">Privacy details</a>') +
      '</p><div class="consent-actions">' +
        '<button type="button" class="btn btn-teal btn-sm" data-consent="granted">' + (arA ? 'موافق' : 'Accept') + '</button>' +
        '<button type="button" class="btn btn-outline-white btn-sm" data-consent="denied">' + (arA ? 'رفض' : 'Decline') + '</button>' +
      '</div>';
    bar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-consent]');
      if (!button) return;
      var choice = button.getAttribute('data-consent');
      saveChoice(choice);
      bar.remove();
      if (choice === 'granted') loadAnalytics();
    });
    document.body.appendChild(bar);
  }

  if (analyticsOn) {
    var choice = readChoice();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') askConsent();
  }

  // Privacy page: "Change my choice" forgets the choice, deletes the analytics cookies and asks again
  var reset = document.querySelector('[data-analytics-reset]');
  if (reset) {
    if (analyticsOn) {
      reset.hidden = false;
      reset.addEventListener('click', function () {
        saveChoice(null);
        document.cookie.split(';').forEach(function (c) {
          var name = c.split('=')[0].trim();
          if (/^_ga/.test(name)) {
            ['', '; domain=' + location.hostname, '; domain=.' + location.hostname.replace(/^www\./, '')].forEach(function (d) {
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
            });
          }
        });
        location.reload();
      });
    } else {
      var off = document.querySelector('.analytics-off');
      if (off) off.hidden = false;
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

  // Photo viewer: links marked data-lightbox open their full-size photo in a popup, with
  // previous/next through the other photos in the same gallery. Without this script the
  // link simply opens the photo.
  var photoLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (photoLinks.length && window.HTMLDialogElement) {
    var arL = document.documentElement.lang === 'ar';
    var box = document.createElement('dialog');
    box.className = 'lightbox';
    var arrow = function (d) { return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    box.innerHTML =
      '<button type="button" class="lightbox-close" autofocus aria-label="' + (arL ? 'إغلاق' : 'Close') + '">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button type="button" class="lightbox-nav lightbox-prev" aria-label="' + (arL ? 'الصورة السابقة' : 'Previous photo') + '">' + arrow('m15 18-6-6 6-6') + '</button>' +
      '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lightbox-nav lightbox-next" aria-label="' + (arL ? 'الصورة التالية' : 'Next photo') + '">' + arrow('m9 18 6-6-6-6') + '</button>';
    document.body.appendChild(box);

    var boxImg = box.querySelector('img');
    var boxCaption = box.querySelector('figcaption');
    var group = [], current = 0;

    function showPhoto(i) {
      current = (i + group.length) % group.length;
      var link = group[current], thumb = link.querySelector('img');
      boxImg.src = link.href;
      boxImg.alt = thumb ? thumb.alt : '';
      // Written out in Arabic: a right-to-left "2 / 3" would display as "3 / 2"
      var count = arL ? (current + 1) + ' من ' + group.length : (current + 1) + ' / ' + group.length;
      boxCaption.textContent = (thumb ? thumb.alt : '') + (group.length > 1 ? '  ·  ' + count : '');
    }

    photoLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        var gallery = link.closest('.gallery') || document.body;
        group = photoLinks.filter(function (l) { return gallery.contains(l); });
        box.classList.toggle('single', group.length < 2);
        showPhoto(group.indexOf(link));
        box.showModal();
        document.documentElement.classList.add('has-dialog');
      });
    });

    // In a right-to-left page the "previous" button sits on the right, so it still points backwards
    box.querySelector('.lightbox-prev').addEventListener('click', function () { showPhoto(current - 1); });
    box.querySelector('.lightbox-next').addEventListener('click', function () { showPhoto(current + 1); });
    box.querySelector('.lightbox-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (event) {
      if (event.target === box || event.target.classList.contains('lightbox-figure')) box.close();
    });
    box.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var forward = (event.key === 'ArrowRight') !== arL;   // the arrows follow the reading direction
      showPhoto(current + (forward ? 1 : -1));
      event.preventDefault();
    });
    box.addEventListener('close', function () {
      document.documentElement.classList.remove('has-dialog');
      boxImg.removeAttribute('src');
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
