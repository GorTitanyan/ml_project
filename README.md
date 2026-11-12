# ML lessons — interactive research explainers

Static site (HTML/CSS/JS, no npm, no build). English / Armenian switch (button or `L` key).

## Run
    python3 -m http.server 8765
Open http://127.0.0.1:8765

## Layout
- `index.html` — home, list of topics
- `assets/style.css`, `assets/app.js` — shared style, language switch, tooltips
- `global-workspace/` — topic 1 (Anthropic, "A global workspace in language models")
  - `index.html` — text; every paragraph exists twice: `lang="en"` and `lang="hy"`
  - `viz.js` — charts and demos (labels in `T({en, hy})`)

## Add a topic
Copy `global-workspace/` to a new folder, replace text and demos, add a card in `index.html`.

## Edit names
Search "Friend 2" / "Ընկեր 2" in both `index.html` files.

## Publish
Any static host: GitHub Pages, Vercel, Netlify (upload the folder as is).
