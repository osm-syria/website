/* Member registrations, read live from the registration sheet on every visit: the home page's
   "registered members" figure and the About page chart and table.

   SOURCE is a Google Apps Script web app that returns only counts:
     { cellB1: total, rangeK4L40: [["", "Accomulated"], ["2025-Apr", 74], …, ["2026-Nov", ""], …] }
   While it loads, the pages show a loading state; if it can't be reached or returns something
   unexpected, they show an error message instead of numbers. */
(function () {
  'use strict';

  var SOURCE = 'https://script.google.com/macros/s/AKfycbxk5-f-fGTrxFnwNeDNvm0NsPQmypXEBaC8rdVKTjCHV0ZBQY1MWVHFLNLNRQhEhXcW/exec';
  var TIMEOUT = 20000;

  var ar = document.documentElement.lang === 'ar';
  var MONTHS = ar
    ? ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TEXT = ar ? {
    loading: 'جارٍ تحميل أحدث الأرقام…',
    errorHome: 'تعذّر تحميل عدد الأعضاء المسجّلين حالياً. يرجى المحاولة لاحقاً.',
    errorAbout: 'تعذّر تحميل أرقام التسجيل حالياً. يرجى المحاولة لاحقاً، أو الاطلاع على ',
    data: 'بيانات التسجيل (JSON)',
    source: 'أرقام مباشرة من سجلات التسجيل في المجتمع: ',
    soFar: 'حتى الآن'
  } : {
    loading: 'Loading the latest figures…',
    errorHome: 'Couldn’t load the number of registered members right now. Please try again later.',
    errorAbout: 'Couldn’t load the registration figures right now. Please try again later, or see the ',
    data: 'registration data (JSON)',
    source: 'Live figures from the community’s registration records: ',
    soFar: 'so far'
  };

  var ym = function (s) { var p = s.split('-'); return { y: +p[0], m: +p[1] - 1 }; };
  var monthName = function (o) { return MONTHS[o.m] + ' ' + o.y; };
  var list = function (items) {   // "A and B", "A, B and C" / "أ وب"، "أ، ب وج"
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(ar ? '، ' : ', ') + (ar ? ' و' : ' and ') + items[items.length - 1];
  };
  var link = '<a href="' + SOURCE + '" target="_blank" rel="noopener">' + TEXT.data + '</a>';
  var now = new Date();
  var thisMonth = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);

  var homeStats = Array.prototype.slice.call(document.querySelectorAll('[data-reg-total]'));
  var figure = document.querySelector('[data-registrations-chart]');
  if (!homeStats.length && !figure) return;
  var section = figure ? (figure.closest('.container') || document) : null;
  var status = figure ? figure.querySelector('.chart-status') : null;

  // Check the web app's answer and turn it into [['YYYY-MM', running total], …]
  function parse(json) {
    var total = Number(json && json.cellB1);
    if (!(total > 0)) throw new Error('missing total');
    var months = [];
    (json.rangeK4L40 || []).forEach(function (row) {
      var m = /^(\d{4})-([A-Za-z]{3})$/.exec((row && row[0]) || '');
      if (!m || SHORT_EN.indexOf(m[2]) < 0) return;
      var key = m[1] + '-' + ('0' + (SHORT_EN.indexOf(m[2]) + 1)).slice(-2);
      var value = row[1] === '' || row[1] == null ? NaN : Number(row[1]);
      // The sheet leaves the current month empty until it closes: use the overall total for it
      if (isNaN(value) && key === thisMonth) value = total;
      if (!isNaN(value)) months.push([key, value]);
    });
    if (months.length < 2) throw new Error('not enough months');
    for (var i = 1; i < months.length; i++) {
      if (months[i][0] <= months[i - 1][0] || months[i][1] < months[i - 1][1]) throw new Error('months out of order');
    }
    if (months[months.length - 1][1] > total) throw new Error('monthly total above the overall total');
    return { total: total, months: months };
  }

  function setState(state) {   // 'loading' | 'ready' | 'error'
    if (figure) figure.setAttribute('data-state', state);
    homeStats.forEach(function (n) { n.closest('.stat').setAttribute('data-state', state); });
  }

  function showLoading() {
    setState('loading');
    homeStats.forEach(function (n) { n.textContent = '…'; });
    if (status) status.textContent = TEXT.loading;
  }

  function showError() {
    setState('error');
    homeStats.forEach(function (n) {
      n.textContent = '—';
      var label = n.nextElementSibling;
      if (label) label.textContent = TEXT.errorHome;
    });
    if (!figure) return;
    if (status) status.innerHTML = TEXT.errorAbout + link + '.';
    var headline = section.querySelector('.growth-figure');
    if (headline) headline.hidden = true;   // no number to show; the message below explains
  }

  function render(data) {
    var months = data.months, total = data.total;
    var first = months[0], last = months[months.length - 1];
    setState('ready');

    homeStats.forEach(function (n) { n.textContent = total; });
    if (!figure) return;
    if (status) status.textContent = '';
    var headline = section.querySelector('.growth-figure');
    if (headline) headline.hidden = false;

    var tbody = figure.querySelector('tbody');
    tbody.innerHTML = '';
    months.forEach(function (row) {
      var note = row[0] === thisMonth ? TEXT.soFar : '';   // the current month is still counting
      var tr = document.createElement('tr');
      tr.setAttribute('data-month', row[0]);
      tr.setAttribute('data-value', row[1]);
      if (note) tr.setAttribute('data-note', note);
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = monthName(ym(row[0])) + (note ? ' (' + note + ')' : '');
      var td = document.createElement('td');
      td.textContent = row[1];
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });

    var f = ym(first[0]), l = ym(last[0]);
    var set = function (sel, text) { var n = section.querySelector(sel); if (n) n.textContent = text; };
    set('.growth-figure b', total);
    set('.growth-figure small', ar ? 'ارتفاعاً من ' + first[1] + ' في ' + monthName(f) : 'up from ' + first[1] + ' in ' + monthName(f));
    set('.growth-lead', ar ? 'العدد الإجمالي لتسجيلات الأعضاء في المجتمع منذ ' + monthName(f) + '.' : 'Total member registrations in the community since ' + monthName(f) + '.');
    var plot = figure.querySelector('.chart-plot');
    if (plot) plot.setAttribute('aria-label', ar
      ? 'رسم بياني خطي: ارتفع عدد تسجيلات الأعضاء من ' + first[1] + ' في ' + monthName(f) + ' إلى ' + last[1] + ' في ' + monthName(l) + '.'
      : 'Line chart: member registrations rose from ' + first[1] + ' in ' + monthName(f) + ' to ' + last[1] + ' in ' + monthName(l) + '.');

    // Source link, then the months between the first and the last with no figure
    var have = {}, missing = [];
    months.forEach(function (r) { have[r[0]] = true; });
    for (var i = f.y * 12 + f.m; i < l.y * 12 + l.m; i++) {
      var key = Math.floor(i / 12) + '-' + ('0' + (i % 12 + 1)).slice(-2);
      if (!have[key]) missing.push(monthName(ym(key)));
    }
    var note = figure.querySelector('.chart-note');
    if (note) {
      var text = TEXT.source + link + '.';
      if (missing.length) text += ar
        ? ' لا توجد أرقام مسجّلة ' + (missing.length === 1 ? 'لشهر ' : missing.length === 2 ? 'لشهري ' : 'لأشهر ') + list(missing) + '.'
        : ' No figures were recorded for ' + list(missing) + '.';
      note.innerHTML = text;
    }
    document.dispatchEvent(new CustomEvent('osm-syria:registrations'));
  }

  showLoading();
  if (!window.fetch) { showError(); return; }
  var controller = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT);
  fetch(SOURCE, controller ? { signal: controller.signal, cache: 'no-store' } : { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (json) { clearTimeout(timer); render(parse(json)); })
    .catch(function (err) {
      clearTimeout(timer);
      if (window.console) console.warn('Registration figures unavailable:', err);
      showError();
    });
})();
