# ML Research Seminar — interactive AI interpretability explainers

Static site (HTML/CSS/JS, no npm, no build). English / Armenian switch (button or `L` key).

## Run
    python3 -m http.server 8765
Open http://127.0.0.1:8765

## Layout
- `index.html` — home, list of topics
- `assets/style.css`, `assets/app.js` — shared style, language switch, tooltips
- `global-workspace/` — topic 1: the J-space, how it was found, report / control / reasoning (Anthropic, "A global workspace in language models", part 1)
- `workspace-uses/` — topic 2: automatic work, safety, consciousness (same article, part 2; uses `../global-workspace/viz.js`)
- `tracing-thoughts/` — topic 3 (Anthropic, "Tracing the thoughts of a large language model"), same structure
  - `index.html` — text; every paragraph exists twice: `lang="en"` and `lang="hy"`
  - `viz.js` — charts and demos (labels in `T({en, hy})`)

## Presenting: core vs optional
Parts marked **optional** (dashed orange border, `class="opt"`) can be skipped. The **Core only** button in the top bar (or key `C`) hides them.
Roughly: core ≈ 37 min + questions, full ≈ 53 min + questions. Each page's hero shows its own estimate.

## Add a topic
Copy `global-workspace/` to a new folder, replace text and demos, add a card in `index.html`.

## Edit names
Team: Gor (Գոռ), Aram (Արամ), Artur (Արթուր). Names appear on the home page cards.

## Publish
Any static host: GitHub Pages, Vercel, Netlify (upload the folder as is).
