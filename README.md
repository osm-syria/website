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
  <a href="https://forms.gle/M9F5hz7itZdFDDBS9">Join us</a>
</p>

---

This is the source code of the website of the **OpenStreetMap Syria community (OSM Syria)**. At the moment the site is a bilingual (Arabic and English) "coming soon" page while the full website is being built.

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
| 📝 Join the community | [Registration form](https://forms.gle/M9F5hz7itZdFDDBS9) |
| 💬 Telegram channel | [t.me/OSMSyira](https://t.me/OSMSyira) |
| 📖 OSM Wiki | [wiki.openstreetmap.org/wiki/Syria](https://wiki.openstreetmap.org/wiki/Syria) |
| 🗒️ Meeting notes | [Google Doc](https://docs.google.com/document/d/1zjavmvoauSKdO8bOZHegefcna7cGwBe2Z-xL_7MVijw/edit) |
| 📂 Community drive | [Google Drive](https://drive.google.com/drive/folders/17T3hoYRolEoMWIaqdFQmdXLOSDU6EUu5) |

## The website

The site is a plain static page with no build step or dependencies. It is hosted on **GitHub Pages** and served on the custom domain [openstreetmap.sy](https://openstreetmap.sy) (set in [`CNAME`](CNAME)).

```
.
├── index.html                 # The page: markup, styles and metadata in one file
├── CNAME                      # Custom domain for GitHub Pages
├── LICENSE                    # GPL-3.0
└── assets/
    ├── osm-syria-logo.svg     # Community logo (also the favicon)
    ├── og-image.png           # 1200×630 image for link previews on social media
    └── apple-touch-icon.png   # Home-screen icon for phones
```

### Design notes

- **Bilingual and right-to-left first:** the page uses `lang="ar" dir="rtl"`, with English text marked `lang="en" dir="ltr"`.
- **Colours** come from the logo: teal `#0c7c70` / `#006560`, charcoal `#22242a`, slate `#404e5e`, red `#c1272d`.
- **Font:** [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic), which covers both Arabic and Latin script.
- **SEO and sharing:** Open Graph and Twitter Card tags, plus schema.org `Organization` structured data.
- **Accessibility:** works at phone width, shows focus outlines, and turns off animations for visitors who ask for reduced motion.

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

See the full list on the [contributors page](https://github.com/osm-syria/website/graphs/contributors). If you contribute, add your name here in your pull request.

### OSM Syria community volunteers

This website exists because of the **volunteers of the OSM Syria community**: the mappers, trainers, workshop organisers, translators and everyone who joins a sprint or validates an edit. Their work puts Syria on the map, one road and one building at a time. 💚

شكراً لجميع متطوعي مجتمع OpenStreetMap سوريا، من مُخطّطي الخرائط والمدرّبين ومنظّمي ورشات العمل والمترجمين، وكل من يشارك في ماراثونات رسم الخرائط. بفضلكم تظهر سوريا على الخريطة.

### OpenStreetMap

Map data and the wider project are © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

## License

The website's source code is released under the [GNU General Public License v3.0](LICENSE).
The OSM Syria logo and name belong to the OSM Syria community. Please ask before using them outside community activities.
