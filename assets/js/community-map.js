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

  // Contributor locations from the community uMap (umap.hotosm.org/en/map/osm-syria-community_133), exported on 2026-10-20.
  // Exact locations as members placed them; names and all other details removed. [lon, lat, label index]
  var PTS = [[36.30518,33.490255,0],[36.240442,33.490623,0],[36.29718,33.493599,0],[36.320801,33.504759,0],[36.281662,33.512618,0],[36.295643,33.520289,0],[36.218371,33.521916,0],[36.288319,33.523289,0],[36.296949,33.524796,0],[36.214067,33.525315,0],[36.219915,33.525479,0],[36.332534,33.525786,0],[36.214208,33.527078,0],[36.316181,33.530386,0],[36.296002,33.534169,0],[36.31275,33.552555,0],[36.323794,33.553892,0],[37.174988,36.183382,1],[37.123822,36.186676,1],[37.14867,36.189412,1],[37.1631,36.1994,1],[36.845281,36.516695,1],[37.035437,36.58305,1],[37.045643,36.586793,1],[37.038709,36.606674,1],[39.009876,35.951127,2],[39.192524,36.432392,2],[36.515439,33.406627,3],[36.232524,33.426785,3],[36.075299,33.434198,3],[36.249968,33.435558,3],[36.319771,33.440323,3],[36.234369,33.461449,3],[36.348035,33.487897,3],[36.377995,33.519669,3],[36.381713,33.520045,3],[36.176534,33.532235,3],[36.221158,33.553882,3],[36.364231,33.557394,3],[36.394586,33.566012,3],[36.394516,33.566054,3],[36.408842,33.569804,3],[36.395538,33.571254,3],[36.380768,33.572246,3],[36.195901,33.587838,3],[36.304133,33.597146,3],[36.310357,33.607135,3],[36.670303,33.758599,3],[36.511328,33.827012,3],[36.494247,33.88184,3],[36.745148,34.16428,3],[17.147427,60.675199,4],[106.699219,-6.09686,5],[-5.979137,37.390967,6],[-2.449951,40.664703,6],[36.561694,35.613595,7],[36.817932,35.782044,7],[36.635363,35.930072,7],[55.195313,25.050769,8],[-0.97671,51.431618,9],[39.998914,35.450655,10],[9.181824,48.776103,11],[8.164158,49.021,11],[8.519897,49.462769,11],[10.316769,52.156729,11],[13.342252,52.595645,11],[-73.613892,45.504422,12],[4.943963,43.181147,13],[5.738983,45.179293,13],[4.449463,45.517895,13],[1.888334,46.603354,13],[1.893747,46.608295,13],[1.093972,49.441579,13],[1.063061,49.45921,13],[36.656107,32.779874,14],[36.801191,33.004203,14],[36.721802,34.732584,15],[38.858643,35.228779,15],[36.142273,35.9391,16],[37.363129,37.068328,16],[37.326736,37.074354,16],[29.429038,40.80078,16],[28.973286,41.007432,16],[28.854904,41.010475,16],[28.938192,41.013402,16],[28.854218,41.016275,16],[28.957796,41.019079,16],[28.949431,41.020851,16],[28.913612,41.054829,16],[28.830104,41.055946,16],[28.78418,41.10167,16],[14.414063,48.104543,17],[4.480654,51.027982,18],[31.223145,29.990623,19],[-6.306152,53.348011,20],[4.547034,7.780305,21],[41.230956,37.044961,22],[35.53131,33.884027,23],[46.772232,24.738335,24],[46.667175,24.806681,24],[12.593079,44.087585,25],[139.790039,35.710838,26],[36.084595,34.799145,27]];

  var view = root.querySelector('.map-view');
  if (!view || !window.L) return;

  // Note: locations are rounded to about 20 km, so at street-level zoom a dot marks an approximate area, not an address
  var MAXZ = 19;
  var WORLD = [[-38, -125], [66, 150]];
  var REGIONS = {
    world: WORLD,
    levant: [[26, -10], [60, 48]],   // Europe and the Levant
    syria: [[32.2, 35.6], [37.4, 42.5]],
    damascus: [[33.25, 35.95], [33.8, 36.7]],   // the city and Rural Damascus around it
    aleppo: [[36.0, 36.85], [36.4, 37.45]]
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
