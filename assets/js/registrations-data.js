/* Member registrations: the single source for the About page chart and the home page's
   "registered members" figure, so the two always agree.

   To update: change only this file. `months` lists each month that has data as
   [ 'YYYY-MM', running total ], oldest first; `updated` is the day the numbers were taken.
   The numbers written in the pages are only a fallback (for search engines and visitors
   without JavaScript); this script replaces them on load. */
window.OSM_SYRIA_REGISTRATIONS = {
  updated: '2026-10-21',
  months: [
    ['2025-04', 74], ['2025-05', 127], ['2025-06', 128], ['2025-07', 130], ['2025-09', 134],
    ['2025-10', 136], ['2025-11', 138], ['2025-12', 146], ['2026-01', 167], ['2026-02', 199],
    ['2026-03', 201], ['2026-05', 207], ['2026-06', 214], ['2026-07', 217], ['2026-08', 218],
    ['2026-09', 224], ['2026-10', 227]
  ]
};

(function () {
  'use strict';

  var R = window.OSM_SYRIA_REGISTRATIONS;
  var ar = document.documentElement.lang === 'ar';
  var MONTHS = ar
    ? ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var ym = function (s) { var p = s.split('-'); return { y: +p[0], m: +p[1] - 1 }; };
  var monthName = function (o) { return MONTHS[o.m] + ' ' + o.y; };
  var list = function (items) {   // "A and B", "A, B and C" / "أ وب"، "أ، ب وج"
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(ar ? '، ' : ', ') + (ar ? ' و' : ' and ') + items[items.length - 1];
  };

  var months = R.months;
  var first = months[0], last = months[months.length - 1];
  var total = last[1];
  var upd = R.updated.split('-');
  var updDay = +upd[2], updMonth = { y: +upd[0], m: +upd[1] - 1 };
  var updatedText = updDay + ' ' + monthName(updMonth);

  // Home page: "228 registered members, as of …"
  Array.prototype.forEach.call(document.querySelectorAll('[data-reg-total]'), function (n) { n.textContent = total; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-reg-date]'), function (n) { n.textContent = updatedText; });

  // About page: the table the chart is drawn from, and the texts around it
  var figure = document.querySelector('[data-registrations-chart]');
  if (!figure) return;
  var section = figure.closest('.container') || document;

  var tbody = figure.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = '';
    months.forEach(function (row) {
      var o = ym(row[0]);
      var partial = o.y === updMonth.y && o.m === updMonth.m;   // the current month is only counted up to `updated`
      var note = partial ? (ar ? 'حتى ' : 'to ') + updDay + ' ' + MONTHS[o.m] : '';
      var tr = document.createElement('tr');
      tr.setAttribute('data-month', row[0]);
      tr.setAttribute('data-value', row[1]);
      if (note) tr.setAttribute('data-note', note);
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = monthName(o) + (note ? ' (' + note + ')' : '');
      var td = document.createElement('td');
      td.textContent = row[1];
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
  }

  var f = ym(first[0]), l = ym(last[0]);
  var set = function (sel, text) { var n = section.querySelector(sel); if (n) n.textContent = text; };
  var figureNum = section.querySelector('.growth-figure b');
  if (figureNum) figureNum.textContent = total;
  set('.growth-figure small', ar ? 'ارتفاعاً من ' + first[1] + ' في ' + monthName(f) : 'up from ' + first[1] + ' in ' + monthName(f));
  set('.growth-lead', ar ? 'العدد الإجمالي لتسجيلات الأعضاء في المجتمع منذ ' + monthName(f) + '.' : 'Total member registrations in the community since ' + monthName(f) + '.');

  var plot = figure.querySelector('.chart-plot');
  if (plot) plot.setAttribute('aria-label', ar
    ? 'رسم بياني خطي: ارتفع عدد تسجيلات الأعضاء من ' + first[1] + ' في ' + monthName(f) + ' إلى ' + total + ' في ' + monthName(l) + '.'
    : 'Line chart: member registrations rose from ' + first[1] + ' in ' + monthName(f) + ' to ' + total + ' in ' + monthName(l) + '.');

  // Months between the first and the last with no figure
  var have = {}, missing = [];
  months.forEach(function (r) { have[r[0]] = true; });
  for (var i = f.y * 12 + f.m; i < l.y * 12 + l.m; i++) {
    var key = Math.floor(i / 12) + '-' + ('0' + (i % 12 + 1)).slice(-2);
    if (!have[key]) missing.push(monthName(ym(key)));
  }
  var note = ar ? 'آخر تحديث للبيانات: ' + updatedText + '.' : 'Data updated on ' + updatedText + '.';
  if (missing.length) note += ar
    ? ' لا توجد أرقام مسجّلة ' + (missing.length === 1 ? 'لشهر ' : missing.length === 2 ? 'لشهري ' : 'لأشهر ') + list(missing) + '.'
    : ' No figures were recorded for ' + list(missing) + '.';
  set('.chart-note', note);
})();
