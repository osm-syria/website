/* Home page community map: contributor locations, clustered, with drag, zoom and region presets. */
(function () {
  'use strict';

  var root = document.querySelector('[data-community-map]');
  if (!root) return;

  var EN = document.documentElement.lang === 'en';

  var TEXT = EN ? {
    labels: ['Damascus', 'Aleppo', 'Raqqa', 'Rural Damascus', 'Sweden', 'Indonesia', 'Spain', 'Idlib', 'UAE', 'United Kingdom', 'Deir ez-Zor', 'Germany', 'Canada', 'France', 'As-Suwayda', 'Homs', 'Turkey', 'Austria', 'Belgium', 'Egypt', 'Ireland', 'Nigeria', 'Al-Hasakah', 'Lebanon', 'Saudi Arabia', 'Italy', 'Japan', 'Tartus'],
    num: String,
    count: function (n) { return n + (n === 1 ? ' contributor' : ' contributors'); },
    place: function (names) {
      if (names.length === 1) return names[0];
      if (names.length === 2) return names[0] + ' & ' + names[1];
      return names[0] + ', ' + names[1] + ' and more';
    },
    aria: function (n, place) { return n + (n === 1 ? ' contributor' : ' contributors') + ' in ' + place + ' – select to zoom in'; }
  } : {
    labels: ['دمشق', 'حلب', 'الرقة', 'ريف دمشق', 'السويد', 'إندونيسيا', 'إسبانيا', 'إدلب', 'الإمارات', 'المملكة المتحدة', 'دير الزور', 'ألمانيا', 'كندا', 'فرنسا', 'السويداء', 'حمص', 'تركيا', 'النمسا', 'بلجيكا', 'مصر', 'أيرلندا', 'نيجيريا', 'الحسكة', 'لبنان', 'السعودية', 'إيطاليا', 'اليابان', 'طرطوس'],
    num: String,
    count: function (n) { return this.num(n) + (n === 1 ? ' مساهم' : ' مساهمين'); },
    place: function (names) {
      if (names.length === 1) return names[0];
      if (names.length === 2) return names[0] + ' و' + names[1];
      return names[0] + ' و' + names[1] + ' وغيرها';
    },
    aria: function (n, place) { return this.num(n) + ' مساهم في ' + place + ' – انقر للتكبير'; }
  };

  // Contributor locations from the community uMap, rounded to 0.2° (about 20 km) and stripped of names: [lon, lat, label index].
  var PTS = [[36.2,33.6,0],[37.0,36.6,1],[39.2,36.4,2],[36.4,33.6,3],[36.4,33.6,3],[36.4,33.6,3],[17.2,60.6,4],[106.6,-6.0,5],[39.0,36.0,2],[36.0,33.4,3],[36.2,33.4,3],[36.6,33.4,3],[-6.0,37.4,6],[36.6,36.0,7],[36.2,33.6,0],[55.2,25.0,8],[-1.0,51.4,9],[36.4,33.6,0],[40.0,35.4,10],[36.2,33.6,0],[37.2,36.2,1],[36.2,33.6,0],[36.4,33.6,3],[36.4,33.6,0],[8.2,49.0,11],[36.2,33.6,3],[36.2,33.4,3],[36.4,33.6,3],[-73.6,45.6,12],[13.4,52.6,11],[5.8,45.2,13],[36.4,33.6,3],[36.6,33.8,3],[36.2,33.6,0],[36.2,33.4,3],[36.2,33.6,0],[37.0,36.6,1],[36.4,33.6,3],[37.2,36.2,1],[37.2,36.2,1],[36.2,33.4,0],[1.8,46.6,13],[36.6,32.8,14],[36.4,33.6,3],[36.8,34.8,15],[36.6,35.6,7],[37.4,37.0,16],[1.0,49.4,13],[29.0,41.0,16],[29.0,41.0,16],[28.8,41.0,16],[29.0,41.0,16],[14.4,48.2,17],[28.8,41.0,16],[4.4,51.0,18],[8.6,49.4,11],[1.8,46.6,13],[31.2,30.0,19],[36.4,33.6,3],[-6.4,53.4,20],[9.2,48.8,11],[38.8,35.2,15],[36.4,33.4,0],[4.6,7.8,21],[36.4,33.8,3],[41.2,37.0,22],[36.4,33.4,3],[36.2,36.0,16],[35.6,33.8,23],[36.6,33.8,3],[36.8,36.6,1],[29.4,40.8,16],[46.6,24.8,24],[36.2,33.6,3],[36.4,33.6,0],[36.4,33.6,0],[36.2,33.6,0],[4.4,45.6,13],[12.6,44.0,25],[36.2,33.4,3],[36.4,33.4,3],[1.0,49.4,13],[28.8,41.0,16],[29.0,41.0,16],[46.8,24.8,24],[36.2,33.6,0],[10.4,52.2,11],[36.8,33.0,14],[36.2,33.6,3],[5.0,43.2,13],[37.2,36.2,1],[37.4,37.0,16],[36.4,33.6,3],[-2.4,40.6,6],[139.8,35.8,26],[36.8,35.8,7],[29.0,41.0,16],[36.4,33.6,3],[28.8,41.2,16],[36.0,34.8,27],[36.2,33.6,0]];

  var ASPECT = 1440 / 544;
  var MAXZ = 24;
  var toX = function (lon) { return (lon + 180) / 360; };
  var toY = function (lat) { return (80 - lat) / 136; };

  var view = root.querySelector('.map-view');
  var stage = root.querySelector('.map-stage');
  var syria = root.querySelector('.map-syria');
  var tip = root.querySelector('.map-tip');
  var buttons = new Map();
  var state = { z: 1, vx: 0, vy: 0, hover: null };
  var drag = null;
  var dragEnd = 0;

  function clampView(z, vx, vy) {
    var zz = Math.max(1, Math.min(MAXZ, z));
    var m = 1 - 1 / zz;
    return { z: zz, vx: Math.max(0, Math.min(m, vx)), vy: Math.max(0, Math.min(m, vy)) };
  }

  function update(next) {
    Object.assign(state, next);
    render();
  }

  function zoomAt(f, px, py) {
    var wx = state.vx + px / state.z;
    var wy = state.vy + py / state.z;
    var z = Math.max(1, Math.min(MAXZ, state.z * f));
    update(Object.assign(clampView(z, wx - px / z, wy - py / z), { hover: null }));
  }

  function centerOn(x, y, z) {
    var zz = Math.min(MAXZ, z);
    update(Object.assign(clampView(zz, x - 0.5 / zz, y - 0.5 / zz), { hover: null }));
  }

  function clusters() {
    var cell = 0.03 / state.z;
    var groups = {};
    PTS.forEach(function (p) {
      var x = toX(p[0]);
      var y = toY(p[1]);
      var k = Math.floor(x / cell) + ':' + Math.floor(y / (cell * ASPECT));
      var g = groups[k] || (groups[k] = { key: k, n: 0, sx: 0, sy: 0, labels: {} });
      g.n += 1;
      g.sx += x;
      g.sy += y;
      g.labels[p[2]] = (g.labels[p[2]] || 0) + 1;
    });
    return Object.keys(groups).map(function (k) {
      var g = groups[k];
      var cx = g.sx / g.n;
      var cy = g.sy / g.n;
      var names = Object.keys(g.labels)
        .sort(function (a, b) { return g.labels[b] - g.labels[a]; })
        .map(function (li) { return TEXT.labels[li]; });
      return {
        key: g.key, n: g.n, cx: cx, cy: cy,
        left: (cx - state.vx) * state.z * 100,
        top: (cy - state.vy) * state.z * 100,
        place: TEXT.place(names)
      };
    }).filter(function (c) {
      return c.left > -5 && c.left < 105 && c.top > -5 && c.top < 105;
    });
  }

  function render() {
    stage.style.transform = 'translate(' + (-state.vx * state.z * 100) + '%, ' + (-state.vy * state.z * 100) + '%) scale(' + state.z + ')';
    syria.style.opacity = state.z >= 5 ? 1 : state.z >= 3 ? 0.55 : 0;

    var seen = new Set();
    clusters().forEach(function (c) {
      var b = buttons.get(c.key);
      if (!b) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = 'clu';
        b.dataset.key = c.key;
        view.insertBefore(b, tip);
        buttons.set(c.key, b);
      }
      seen.add(c.key);
      var size = Math.round(14 + 8 * Math.log2(c.n));
      b.style.left = c.left + '%';
      b.style.top = c.top + '%';
      b.style.width = b.style.height = size + 'px';
      b.style.fontSize = Math.max(11, Math.round(size * 0.38)) + 'px';
      b.textContent = c.n > 1 ? TEXT.num(c.n) : '';
      b.setAttribute('aria-label', TEXT.aria(c.n, c.place));
      b.cluster = c;
    });
    buttons.forEach(function (b, k) {
      if (seen.has(k)) return;
      if (document.activeElement === b) view.focus({ preventScroll: true });
      b.remove();
      buttons.delete(k);
    });

    var hovered = state.hover && buttons.get(state.hover);
    tip.hidden = !hovered;
    if (hovered) {
      var c = hovered.cluster;
      tip.style.left = c.left + '%';
      tip.style.top = c.top + '%';
      tip.firstElementChild.textContent = TEXT.count(c.n);
      tip.lastElementChild.textContent = c.place;
    }
  }

  function clusterFrom(target) {
    return target.closest && target.closest('.clu');
  }

  view.addEventListener('click', function (e) {
    var b = clusterFrom(e.target);
    if (!b || Date.now() - dragEnd < 250) return;
    centerOn(b.cluster.cx, b.cluster.cy, Math.max(state.z * 2.5, 3));
  });

  view.addEventListener('dblclick', function (e) {
    if (clusterFrom(e.target)) return;
    var r = view.getBoundingClientRect();
    zoomAt(2, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });

  function hoverOn(e) {
    var b = clusterFrom(e.target);
    if (b && state.hover !== b.dataset.key) update({ hover: b.dataset.key });
  }
  function hoverOff(e) {
    if (clusterFrom(e.target) && state.hover) update({ hover: null });
  }
  view.addEventListener('mouseover', hoverOn);
  view.addEventListener('focusin', hoverOn);
  view.addEventListener('mouseout', hoverOff);
  view.addEventListener('focusout', hoverOff);

  view.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    var r = view.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, vx: state.vx, vy: state.vy, w: r.width, h: r.height, moved: false };
  });

  view.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var mx = e.clientX - drag.x;
    var my = e.clientY - drag.y;
    if (!drag.moved && Math.abs(mx) + Math.abs(my) < 5) return;
    drag.moved = true;
    view.classList.add('is-dragging');
    update(Object.assign(clampView(state.z, drag.vx - mx / drag.w / state.z, drag.vy - my / drag.h / state.z), { hover: null }));
  });

  function endDrag() {
    if (drag && drag.moved) dragEnd = Date.now();
    drag = null;
    view.classList.remove('is-dragging');
  }
  view.addEventListener('pointerup', endDrag);
  view.addEventListener('pointerleave', endDrag);
  view.addEventListener('pointercancel', endDrag);

  root.addEventListener('click', function (e) {
    var control = e.target.closest('[data-map]');
    if (!control) return;
    switch (control.getAttribute('data-map')) {
      case 'in': zoomAt(1.8, 0.5, 0.5); break;
      case 'out': zoomAt(1 / 1.8, 0.5, 0.5); break;
      case 'europe': centerOn(toX(22), toY(43), 3.4); break;
      case 'syria': centerOn(toX(38.6), toY(34.9), 14); break;
      default: update({ z: 1, vx: 0, vy: 0, hover: null });
    }
  });

  render();
})();
