<p align="center">
  <img src="assets/apple-touch-icon.png" alt="OSM Syria logo" width="120">
</p>

<h1 align="center">OpenStreetMap Syria · مجتمع OpenStreetMap سوريا</h1>

<p align="center">
  <strong>Accurate, open maps are not a luxury. They are infrastructure.</strong><br>
  الخرائط الدقيقة والمفتوحة ليست رفاهية، بل هي بنية تحتية.
</p>

<p align="center">
  <a href="https://openstreetmap.sy">openstreetmap.sy</a> ·
  <a href="https://t.me/OSMSyira">Telegram</a> ·
  <a href="https://wiki.openstreetmap.org/wiki/Syria">OSM Wiki</a> ·
  <a href="https://forms.gle/d3k5zpYSSTCM16Ad6">Join us</a>
</p>

---

This is the source code of the website of the **OpenStreetMap Syria community (OSM Syria)**. The site has six pages (home, about, goals, activities, an activity page and join) in Arabic, with an English version of each under `/en/`.

## About the community

OSM Syria is a volunteer-run open mapping community built around [OpenStreetMap](https://www.openstreetmap.org), the free, editable map of the world. It started in **December 2024**, after the political change in Syria, and brings together Syrians inside the country and abroad who share an interest in mapping and open-source technology.

There is **no hierarchy and there are no titles**: everyone is equal in tasks, activity, participation and organisation.

### Goals

- Build and maintain open maps of Syria for humanitarian response, urban planning and sharing geographic data.
- Grow the network of Syrians, at home and abroad, who are interested in mapping and geography.
- Organise volunteer activities and free training in mapping and geospatial technology.

### Activities

- 🎓 **Online introductory sessions** for new mappers
- 🗺️ **Mapping sprints**: online sessions that focus on specific Syrian governorates
- 🛠️ **In-person workshops** inside Syria
- 🌍 Taking part in **State of the Map** conferences

Most activities are in **Arabic**, and anyone can take part, whatever their nationality or location.

### Get involved

| | |
|---|---|
| 📝 Join the community | [Registration form](https://forms.gle/d3k5zpYSSTCM16Ad6) |
| 💬 Telegram channel | [t.me/OSMSyira](https://t.me/OSMSyira) |
| 💼 LinkedIn | [linkedin.com/company/openstreetmap-sy](https://www.linkedin.com/company/openstreetmap-sy/) |
| 📖 OSM Wiki | [wiki.openstreetmap.org/wiki/Syria](https://wiki.openstreetmap.org/wiki/Syria) |
| 🗒️ Meeting notes | [Google Doc](https://docs.google.com/document/d/1zjavmvoauSKdO8bOZHegefcna7cGwBe2Z-xL_7MVijw/edit) |
| 📂 Community drive | [Google Drive](https://drive.google.com/drive/folders/17T3hoYRolEoMWIaqdFQmdXLOSDU6EUu5) |

## The website

The site is plain HTML, CSS and JavaScript with no build step or dependencies. It is hosted on **GitHub Pages** and served on the custom domain [openstreetmap.sy](https://openstreetmap.sy) (set in [`CNAME`](CNAME)). Pushing to `develop` publishes a preview at [demo.openstreetmap.sy](https://demo.openstreetmap.sy).

```
.
├── index.html                       # Home (Arabic)
├── about/index.html                 # About the community
├── goals/index.html                 # Community goals
├── activities/index.html            # All activities, with past/upcoming and type filters
├── activities/douma-workshop/       # Activity page: Douma workshop
├── join/index.html                  # How to join
├── en/…                             # English version of every page above, same paths under /en/
├── 404.html                         # Page-not-found page (served by GitHub Pages); loads en/404.html under /en/
├── robots.txt                       # Crawler rules and sitemap location
├── sitemap.xml                      # Sitemap for search engines, with Arabic/English alternates
├── site.webmanifest                 # App name, colours and icons
├── CNAME                            # Custom domain for GitHub Pages
├── LICENSE                          # GPL-3.0
└── assets/
    ├── css/site.css                 # All styles, shared by every page and both languages
    ├── js/activities.js             # Activities page filters
    ├── js/community-map.js          # Home page contributor map: clusters on an OpenStreetMap base map
    ├── vendor/leaflet/              # Leaflet 1.9.4 (BSD-2-Clause), the map library used by the community map
    ├── img/osm-syria-mark.svg       # Logo mark used in the header, footer and banners
    ├── img/syria.svg                # Map of Syria (home hero, community map overlay)
    ├── osm-syria-logo.svg           # Full community logo (also the favicon)
    ├── icon-48/192/512.png          # PNG icons (favicon, manifest, search-engine logo)
    ├── og-image.png                 # 1200×630 image for link previews on social media
    └── apple-touch-icon.png         # Home-screen icon for phones
```

### Preview locally

Open `index.html` directly in a browser; no server is needed. Pages link to each other and to `assets/` with relative paths, and folder links point at the page file itself (`about/index.html`, `../assets/css/site.css`), so the site works from disk as well as on GitHub Pages. Keep new links in that form: a root path such as `/about/` only works on a web server. Online, `assets/js/site.js` removes `index.html` from these links and from the address bar, so visitors see clean URLs such as `openstreetmap.sy/about/`. Links to other websites open in a new tab: give them `target="_blank" rel="noopener"`. The exceptions are `404.html` and `en/404.html`: GitHub Pages serves them at any broken URL, so they must keep root paths.

A local server works too, if you prefer one:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

### Common edits

- **Add an activity:** copy a card in `activities/index.html` and `en/activities/index.html`. Set `data-type` (`mapathon`, `meeting`, `workshop`, `webinar` or `article`), the matching `badge-…` and `cover-…` classes, and the date in `<time datetime="YYYY-MM-DD">`. Cards dated today or later appear under **Upcoming** automatically. Each card has one of two covers:
  - **With a recording:** make the card a link to the video (`<a class="card" href="https://www.youtube.com/watch?v=…">`) and use a `cover-video` cover with the thumbnail saved in `assets/img/activities/` (800×450 JPG named `YYYY-MM-DD-name.jpg`; take `https://i.ytimg.com/vi/<video id>/maxresdefault.jpg` and resize it).
  - **Without a recording:** use a `cover-plain` cover: the type's colour and icon with a calendar tile showing the date. Copy one from a card of the same type and change the month and day.

  Keep cards newest first. If it should also show on the home page, replace one of the three cards under "آخر الأنشطة" / "Latest activities".
- **Add an activity page:** copy `activities/douma-workshop/` (and its `/en/` twin) to a new folder. Update the text, the `<title>`, the description, `canonical`, `hreflang` and Open Graph URLs, and the `Event` structured data. Turn the activity's cards into links (`<a class="card" href="…">`) and add both URLs to `sitemap.xml`.
- **Make photos open full size:** wrap each gallery photo in `<a class="gallery-link" href="…-full.jpg" data-lightbox>` (as in the About page's "From our meetups"). `assets/js/site.js` opens it in a photo viewer, with previous/next through the same gallery and the photo's `alt` text as the caption. Full-size photos are at most 1920px on the long side, with location data removed.
- **Show an external page in a popup:** add `data-embed="Popup title"` to a link (as on the goals page's before-and-after comparisons). `assets/js/site.js` then opens it in an iframe popup instead of a new tab. Only use it for sites that allow being embedded.
- **Footer "last updated" date:** filled in by `assets/js/site.js` from the date of the latest commit on the branch the site is published from (`main` for openstreetmap.sy, `develop` for demo.openstreetmap.sy), using GitHub's public API and cached in the browser for an hour. It stays hidden when the site is opened from disk or GitHub can't be reached. The copyright year updates itself.
- **Change the header or footer:** they are repeated in every page (12 pages plus `404.html` and `en/404.html`), so make the same change in each.
- **Add photos:** the dashed `[صورة]` / `[Photo]` boxes are placeholders. Replace each one with an `<img>` with descriptive `alt` text.

### Visit statistics (Google Analytics)

The site counts visits with Google Analytics 4, **on by default**: it starts on the first visit, and a one-time bar tells visitors so, with a Close button and a link to the privacy settings. Visitors can turn statistics off (or back on) on the privacy page; turning them off also deletes the statistics cookie. **Note:** in the EU (GDPR/ePrivacy), analytics cookies normally need consent *before* they are set, so this opt-out model is a legal risk for EU visitors. Statistics only run on `openstreetmap.sy`, never on the demo or a local copy. What is and isn't collected is explained on the privacy page (`privacy/` and `en/privacy/`); keep it accurate if you change any of the settings below.

To switch it on:

1. In [Google Analytics](https://analytics.google.com/), create a property for the community and a **Web** data stream for `https://openstreetmap.sy`. Copy its **Measurement ID** (`G-XXXXXXXXXX`).
2. In the property's **Admin** settings, match what the privacy page promises:
   - **Data collection**: leave **Google signals** off.
   - **Data retention**: set event data retention to **2 months**.
   - **Data collection → Granular location and device data**: optional, can be turned off for even less detail.
   - Don't link the property to Google Ads.
3. Paste the ID into `GA_ID` near the top of the statistics code in `assets/js/site.js`, then commit and deploy.

The script also turns off ad storage, ad personalisation and Google signals, and sets the analytics cookie to expire after 6 months. Visitors can turn statistics off or on from the privacy page (`privacy/#settings`).

### Design notes

- **Mentioning OpenStreetMap:** every visible "OpenStreetMap" (the project, not the community's own name "OpenStreetMap Syria") has the tiny OSM logo in front. In plain text, link it to the project: `<a class="osm-mention" href="https://www.openstreetmap.org/" target="_blank" rel="noopener"><img class="osm-logo" src="…/assets/img/osm/osm-logo-48.png" alt="" width="16" height="16">OpenStreetMap</a>`. Inside an existing link, add only the logo, wrapped with the word in `<span class="osm-word">`. Where the community describes itself ("…a volunteer community built around OpenStreetMap": the home tagline, the About introduction and the footer), use the logo without a link, in `<span class="osm-word">`.
- **One language per page, right-to-left first:** Arabic pages use `lang="ar" dir="rtl"` and English pages under `/en/` use `lang="en" dir="ltr"`. Each page is written entirely in its own language; don't add translations of the text in the other language. Both languages write numbers with the digits 0–9 (for example "26 أيلول 2026"), not the Eastern Arabic-Indic digits ٠–٩. Only names (the OSM SYRIA wordmark, tool and platform names) stay as they are. The stylesheet uses logical properties (`margin-inline`, `inset-inline-start`, …) so the same CSS serves both directions. The header's EN / عربي link goes to the same page in the other language.
- **Colours** come from the logo: teal `#0c7c70` / `#006560`, mint `#8fe0d3`, charcoal `#22242a` / `#21242a`, slate `#404e5e`, red `#c1272d`. They are defined once as CSS custom properties at the top of `site.css`.
- **Fonts:** [Cairo](https://fonts.google.com/specimen/Cairo) for Arabic and headings, [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) for English text.
- **SEO and sharing:** each page has its own title, description, canonical URL, Arabic/English `hreflang` alternates, Open Graph and Twitter Card tags, and schema.org structured data: `Organization`, `WebSite` and `FAQPage` on the home page, an `Event` for every activity on the activities pages, and `BreadcrumbList` on inner pages. The site's name for search engines is **OSM Syria**, with "OpenStreetMap Syria" and the Arabic names as alternates; every page title ends in "OSM Syria (OpenStreetMap Syria)" ("مجتمع OpenStreetMap سوريا (OSM Syria)" in Arabic). When you add an activity card, add its `Event` too, and update `dateModified` and the sitemap's `lastmod` when a page changes. The demo build marks every page `noindex` so it never competes with openstreetmap.sy.
- **Accessibility:** works at phone width, shows focus outlines, keeps content readable without JavaScript, and turns off animations for visitors who ask for reduced motion.
- **Member registrations:** `assets/js/registrations-data.js` is the single source for the About page chart and the home page's "registered members" figure, so they always agree. To update, edit only that file: add or change `['YYYY-MM', running total]` and set `updated` to the day the numbers were taken. The chart, its table, the headline, the notes (including months with no figures) and the home figure all update from it. The numbers written in the HTML are only a fallback for search engines and visitors without JavaScript; refresh them when convenient.
- **Community map data:** the home page map shows the locations members added to the [community map on uMap](https://umap.hotosm.org/en/map/osm-syria-community_133), exactly as placed, with names and all other details removed (only coordinates and a country or governorate label are kept, in `assets/js/community-map.js`). It is a snapshot, not a live feed: to update it, export the uMap layers, keep only the coordinates, label each point with its country (or governorate inside Syria), and recompute the statistics and bars under the map on both home pages.

### Contributing

Contributions are welcome, from translations and copy edits to design and new pages.

1. Fork the repository and create a branch.
2. Make your change and check it in a browser at both desktop and phone width.
3. Open a pull request with a short description and, for visual changes, a screenshot.

To get in touch first, ask in the [Telegram channel](https://t.me/OSMSyira).

## Credits · شكر وتقدير

### Website contributors

Thank you to everyone who has helped build this website:

- **Omran Najjar** ([@omranlm](https://github.com/omranlm)): initial website, design and setup
- **Mohamad** ([@SourceM7](https://github.com/SourceM7)): the bilingual website redesign: all pages, the stylesheet, the interactive community map and the activity filters

GitHub's [contributors page](https://github.com/osm-syria/website/graphs/contributors) only lists people whose commit email is linked to their GitHub account, so this list is the complete one. If you contribute, add your name here in your pull request.

### OSM Syria community volunteers

This website exists because of the **volunteers of the OSM Syria community**: the mappers, trainers, workshop organisers, translators and everyone who joins a sprint or validates an edit. Their work puts Syria on the map, one road and one building at a time. 💚

شكراً لجميع متطوعي مجتمع OpenStreetMap سوريا، من مُخطّطي الخرائط والمدرّبين ومنظّمي ورشات العمل والمترجمين، وكل من يشارك في ماراثونات رسم الخرائط. بفضلكم تظهر سوريا على الخريطة.

### OpenStreetMap

Map data and the wider project are © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

## License

The website's source code is released under the [GNU General Public License v3.0](LICENSE).
The OSM Syria logo and name belong to the OSM Syria community. Please ask before using them outside community activities.
