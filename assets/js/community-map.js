/* Home page community map: contributor locations, clustered, on an OpenStreetMap base map (Leaflet). */
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

  // Contributor locations from the community uMap (umap.hotosm.org/en/map/osm-syria-community_133#7/34.944488/38.534546), exported on 2026-10-20.
  // Coordinates are rounded to two decimal places (about 1 km), so the map shows an approximate area,
  // not an address. Names and all other details removed. [lon, lat, label index]
  var PTS = [[36.31,33.49,0],[36.24,33.49,0],[36.3,33.49,0],[36.32,33.5,0],[36.28,33.51,0],[36.3,33.52,0],[36.22,33.52,0],[36.29,33.52,0],[36.3,33.52,0],[36.21,33.53,0],[36.22,33.53,0],[36.33,33.53,0],[36.21,33.53,0],[36.32,33.53,0],[36.3,33.53,0],[36.31,33.55,0],[36.32,33.55,0],[37.17,36.18,1],[37.12,36.19,1],[37.15,36.19,1],[37.16,36.2,1],[36.85,36.52,1],[37.04,36.58,1],[37.05,36.59,1],[37.04,36.61,1],[39.01,35.95,2],[39.19,36.43,2],[36.52,33.41,3],[36.23,33.43,3],[36.08,33.43,3],[36.25,33.44,3],[36.32,33.44,3],[36.23,33.46,3],[36.35,33.49,3],[36.38,33.52,3],[36.38,33.52,3],[36.18,33.53,3],[36.22,33.55,3],[36.36,33.56,3],[36.39,33.57,3],[36.39,33.57,3],[36.41,33.57,3],[36.4,33.57,3],[36.38,33.57,3],[36.2,33.59,3],[36.3,33.6,3],[36.31,33.61,3],[36.67,33.76,3],[36.51,33.83,3],[36.49,33.88,3],[36.75,34.16,3],[17.15,60.68,4],[106.7,-6.1,5],[-5.98,37.39,6],[-2.45,40.66,6],[36.56,35.61,7],[36.82,35.78,7],[36.64,35.93,7],[55.2,25.05,8],[-0.98,51.43,9],[40,35.45,10],[9.18,48.78,11],[8.16,49.02,11],[8.52,49.46,11],[10.32,52.16,11],[13.34,52.6,11],[-73.61,45.5,12],[4.94,43.18,13],[5.74,45.18,13],[4.45,45.52,13],[1.89,46.6,13],[1.89,46.61,13],[1.09,49.44,13],[1.06,49.46,13],[36.66,32.78,14],[36.8,33,14],[36.72,34.73,15],[38.86,35.23,15],[36.14,35.94,16],[37.36,37.07,16],[37.33,37.07,16],[29.43,40.8,16],[28.97,41.01,16],[28.85,41.01,16],[28.94,41.01,16],[28.85,41.02,16],[28.96,41.02,16],[28.95,41.02,16],[28.91,41.05,16],[28.83,41.06,16],[28.78,41.1,16],[14.41,48.1,17],[4.48,51.03,18],[31.22,29.99,19],[-6.31,53.35,20],[4.55,7.78,21],[41.23,37.04,22],[35.53,33.88,23],[46.77,24.74,24],[46.67,24.81,24],[12.59,44.09,25],[139.79,35.71,26],[36.08,34.8,27]];

  var view = root.querySelector('.map-view');
  if (!view || !window.L) return;
  var fallback = view.querySelector('.map-fallback');
  if (fallback) fallback.parentNode.removeChild(fallback);

  // Marker positions are approximate (see PTS above): street-level zoom shows an area, not an address.
  var MAXZ = 19;
  var WORLD = [[-38, -125], [66, 150]];
  var REGIONS = {
    world: WORLD,
    levant: [[26, -10], [62, 48]],   // Europe and the Levant; includes Sweden at 60.68°N
    syria: [[32.2, 35.6], [37.05, 42.5]],   // includes Al-Hasakah at 37.04°N, stays below the Turkish points at 37.07°N
    damascus: [[33.2, 35.9], [34.25, 36.8]],   // the city and Rural Damascus around it
    aleppo: [[36.0, 36.75], [36.7, 37.3]]
  };
  // The OSM logo sits next to the credit, as next to every mention of OpenStreetMap; its path is found from the Leaflet stylesheet's
  var css = document.querySelector('link[href*="vendor/leaflet/leaflet.css"]');
  var logo = css ? css.getAttribute('href').replace('vendor/leaflet/leaflet.css', 'img/osm/osm-logo-48.png') : '';
  var CREDIT = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"><span class="osm-word">' +
    (logo ? '<img class="osm-logo" src="' + logo + '" alt="" width="16" height="16">' : '') + 'OpenStreetMap</span></a> contributors';

  var map = L.map(view, {
    zoomControl: false,
    scrollWheelZoom: true,
    wheelPxPerZoomLevel: 120,   // one notch of a mouse wheel is about one zoom level
    worldCopyJump: true,
    minZoom: 1,
    maxZoom: MAXZ,
    zoomSnap: 1,   // whole zoom levels only: in-between levels show seams between map tiles
    attributionControl: false
  });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  // The map credit sits at the opposite corner from the legend, which follows the reading direction
  L.control.attribution({ prefix: false, position: EN ? 'bottomright' : 'bottomleft' }).addAttribution(CREDIT).addTo(map);
  map.fitBounds(WORLD);

  var layer = L.layerGroup().addTo(map);

  // Group nearby contributors into one numbered marker; the grouping is redone at each zoom level
  function drawClusters() {
    layer.clearLayers();
    var z = map.getZoom();
    var CELL = 64;   // at least as wide as the biggest marker, so markers don't overlap
    var groups = {};
    PTS.forEach(function (p) {
      var pt = map.project([p[1], p[0]], z);
      var k = Math.floor(pt.x / CELL) + ':' + Math.floor(pt.y / CELL);
      var g = groups[k] || (groups[k] = { n: 0, lat: 0, lon: 0, labels: {} });
      g.n += 1;
      g.lat += p[1];
      g.lon += p[0];
      g.labels[p[2]] = (g.labels[p[2]] || 0) + 1;
    });
    // Second pass: grid neighbours can still sit closer than their markers are wide, so merge any that would overlap
    var list = Object.keys(groups).map(function (k) { return groups[k]; });
    var sizeOf = function (n) { return Math.min(56, Math.round(18 + 7 * Math.log2(n))); };
    var px = function (g) { return map.project([g.lat / g.n, g.lon / g.n], z); };
    for (var merged = true; merged;) {
      merged = false;
      for (var i = 0; i < list.length && !merged; i++) {
        for (var j = i + 1; j < list.length; j++) {
          if (px(list[i]).distanceTo(px(list[j])) < (sizeOf(list[i].n) + sizeOf(list[j].n)) / 2 + 6) {
            var a = list[i], b = list.splice(j, 1)[0];
            a.n += b.n; a.lat += b.lat; a.lon += b.lon;
            Object.keys(b.labels).forEach(function (li) { a.labels[li] = (a.labels[li] || 0) + b.labels[li]; });
            merged = true;
            break;
          }
        }
      }
    }
    list.forEach(function (g) {
      var center = [g.lat / g.n, g.lon / g.n];
      var names = Object.keys(g.labels)
        .sort(function (a, b) { return g.labels[b] - g.labels[a]; })
        .map(function (li) { return TEXT.labels[li]; });
      var place = TEXT.place(names);
      var size = sizeOf(g.n);
      var marker = L.marker(center, {
        keyboard: true,
        icon: L.divIcon({ className: 'clu', html: g.n > 1 ? TEXT.num(g.n) : '', iconSize: [size, size] })
      });
      marker.bindTooltip('<b>' + TEXT.count(g.n) + '</b><span>' + place + '</span>', {
        className: 'map-tip', direction: 'top', offset: [0, -size / 2 - 4], opacity: 1
      });
      marker.on('click', function () {
        map.setView(center, Math.min(MAXZ, Math.max(map.getZoom() + 2, g.n > 1 ? 4 : 6)), { animate: true });
      });
      marker.on('add', function () {
        var el = marker.getElement();
        el.setAttribute('aria-label', TEXT.aria(g.n, place));
        el.style.fontSize = Math.max(11, Math.round(size * 0.38)) + 'px';
      });
      layer.addLayer(marker);
    });
  }

  map.on('zoomend', drawClusters);
  drawClusters();

  root.addEventListener('click', function (e) {
    var control = e.target.closest('[data-map]');
    if (!control) return;
    var which = control.getAttribute('data-map');
    if (which === 'in') map.zoomIn(1);
    else if (which === 'out') map.zoomOut(1);
    // Standard zoom rather than a long fly animation: tiles for the new view load reliably
    else map.fitBounds(REGIONS[which] || WORLD, { animate: true });
  });

  // The map is laid out before fonts and images settle; measure again once the page has loaded
  window.addEventListener('load', function () { map.invalidateSize(); });
})();
