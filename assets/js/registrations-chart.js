/* About page: line chart of total member registrations.
   Drawn from the page's table (one row per month: data-month="YYYY-MM", data-value), which
   registrations-data.js fills first from the shared data. Months without a row show as a
   straight line with no dot. */
(function () {
  'use strict';

  var figure = document.querySelector('[data-registrations-chart]');
  if (!figure) return;

  var plot = figure.querySelector('.chart-plot');
  var rows = figure.querySelectorAll('tr[data-month]');
  var ar = document.documentElement.lang === 'ar';
  var MONTHS = ar
    ? ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SHORT = ar ? MONTHS : MONTHS.map(function (m) { return m.slice(0, 3); });
  var unit = function (n) { return ar ? n + ' تسجيلاً' : n + ' registrations'; };

  var data = Array.prototype.map.call(rows, function (row) {
    var ym = row.getAttribute('data-month').split('-');
    return { y: +ym[0], m: +ym[1] - 1, value: +row.getAttribute('data-value'), note: row.getAttribute('data-note') || '' };
  });
  if (data.length < 2) return;
  var start = data[0].y * 12 + data[0].m;
  data.forEach(function (d) { d.i = d.y * 12 + d.m - start; });
  var span = data[data.length - 1].i;

  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  plot.appendChild(tip);

  var svg, width;

  function draw() {
    width = plot.clientWidth;
    if (!width) return;
    var fallback = plot.querySelector('.chart-fallback');
    if (fallback) fallback.parentNode.removeChild(fallback);
    var narrow = width < 520;
    var height = narrow ? 240 : 300;
    var m = { top: 28, right: narrow ? 34 : 44, bottom: 34, left: 38 };
    var w = width - m.left - m.right, h = height - m.top - m.bottom;
    // Follow the data: a fixed 250 clipped the line once registrations passed it
    var highest = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var max = Math.max(50, Math.ceil(highest / 50) * 50);
    var x = function (i) { return m.left + (i / span) * w; };
    var y = function (v) { return m.top + h - (v / max) * h; };

    if (svg) svg.remove();
    svg = el('svg', { width: width, height: height, viewBox: '0 0 ' + width + ' ' + height, 'aria-hidden': 'true', direction: 'ltr' });
    plot.insertBefore(svg, tip);

    // Recessive horizontal grid and y labels
    for (var t = 0; t <= max; t += 50) {
      el('line', { x1: m.left, x2: m.left + w, y1: y(t), y2: y(t), class: t ? 'grid' : 'baseline' }, svg);
      el('text', { x: m.left - 8, y: y(t), class: 'tick', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, svg).textContent = t;
    }

    // Month labels: every 3 months; on narrow screens only the first, the middle and the last.
    // The year shows on the first label and on January.
    var ticks = [];
    if (narrow) ticks = [0, Math.round(span / 2), span];
    else for (var s = 0; s <= span; s += 3) ticks.push(s);
    ticks.forEach(function (i) {
      var mm = (data[0].m + i) % 12, yy = data[0].y + Math.floor((data[0].m + i) / 12);
      var label = SHORT[mm] + (i === 0 || mm === 0 ? ' ' + yy : '');
      el('line', { x1: x(i), x2: x(i), y1: m.top + h, y2: m.top + h + 5, class: 'baseline' }, svg);
      // Arabic labels mix a month name and a year: lay them out right to left so they read correctly
      var edge = i === 0 ? 'first' : (narrow && i === span ? 'last' : '');
      var anchor = edge === 'first' ? (ar ? 'end' : 'start') : edge === 'last' ? (ar ? 'start' : 'end') : 'middle';
      el('text', { x: x(i), y: m.top + h + 22, class: 'tick', direction: ar ? 'rtl' : 'ltr', 'text-anchor': anchor }, svg).textContent = label;
    });

    // Area wash, line, dots
    var line = data.map(function (d, k) { return (k ? 'L' : 'M') + x(d.i).toFixed(1) + ' ' + y(d.value).toFixed(1); }).join('');
    el('path', { d: line + 'L' + x(span) + ' ' + y(0) + 'L' + x(0) + ' ' + y(0) + 'Z', class: 'area' }, svg);
    el('path', { d: line, class: 'line' }, svg);
    data.forEach(function (d) { el('circle', { cx: x(d.i), cy: y(d.value), r: 4, class: 'dot' }, svg); });

    // Direct labels on the first and last values only
    var first = data[0], last = data[data.length - 1];
    el('text', { x: x(first.i), y: y(first.value) + 22, class: 'value', 'text-anchor': 'start' }, svg).textContent = first.value;
    el('text', { x: x(last.i), y: y(last.value) - 14, class: 'value', 'text-anchor': 'end' }, svg).textContent = last.value;

    // Hover: crosshair, highlighted dot and tooltip on the nearest month with data
    var cross = el('line', { y1: m.top, y2: m.top + h, class: 'cross', visibility: 'hidden' }, svg);
    var focus = el('circle', { r: 6, class: 'dot focus', visibility: 'hidden' }, svg);
    var hit = el('rect', { x: m.left, y: m.top - 10, width: w, height: h + 10, fill: 'transparent' }, svg);

    function show(event) {
      var px = event.clientX - svg.getBoundingClientRect().left;
      var best = data.reduce(function (a, d) { return Math.abs(x(d.i) - px) < Math.abs(x(a.i) - px) ? d : a; });
      var cx = x(best.i), cy = y(best.value);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('visibility', 'visible');
      focus.setAttribute('cx', cx); focus.setAttribute('cy', cy); focus.setAttribute('visibility', 'visible');
      tip.innerHTML = '<span>' + MONTHS[best.m] + ' ' + best.y + (best.note ? ' · ' + best.note : '') + '</span><b>' + unit(best.value) + '</b>';
      tip.hidden = false;
      var left = Math.min(Math.max(cx - tip.offsetWidth / 2, 0), width - tip.offsetWidth);
      tip.style.left = left + 'px';
      tip.style.top = Math.max(cy - tip.offsetHeight - 14, 0) + 'px';
    }
    function hide() {
      cross.setAttribute('visibility', 'hidden');
      focus.setAttribute('visibility', 'hidden');
      tip.hidden = true;
    }
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', hide);
  }

  draw();
  if (window.ResizeObserver) {
    var last = plot.clientWidth;
    new ResizeObserver(function () {
      if (plot.clientWidth !== last) { last = plot.clientWidth; draw(); }
    }).observe(plot);
  }
})();
