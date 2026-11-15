# ML Research Seminar — interactive AI interpretability explainers

Static site (HTML/CSS/JS, no npm, no build). English / Armenian switch (button or `L` key).

## Run
    python3 -m http.server 8765
Open http://127.0.0.1:8765

## Layout
- `index.html` — home, list of topics
- `assets/style.css`, `assets/app.js` — shared style, language switch, tooltips
- `tracing-thoughts/` — topic 1 (Anthropic, "Tracing the thoughts of a large language model")
- `introspection/` — topic 2 (Anthropic, "Signs of introspection in large language models")
- `global-workspace/` — topic 3 (Anthropic, "A global workspace in language models"): the J-space, how it was found, report / control / reasoning, automatic work, safety, consciousness
- `workspace-uses/` — old topic 2, now only a redirect into topic 3
- `slides/` — the same three topics as slide decks for presenting (one self-contained `index.html` per talk, plus `slides/index.html` listing them). Keys: → / Space next, ← back, O overview, P presenter window, ? help. They open straight from disk, no server needed.
- each topic folder:
  - `index.html` — text; every paragraph exists twice: `lang="en"` and `lang="hy"`
  - `viz.js` — charts and demos (labels in `T({en, hy})`)

## Presenting: core vs optional
Parts marked **optional** (dashed orange border, `class="opt"`) can be skipped. The **Core only** button in the top bar (or key `C`) hides them.
Roughly: core ≈ 37 min + questions, full ≈ 53 min + questions. Each page's hero shows its own estimate.

## Add a topic
Copy a topic folder (e.g. `introspection/`) to a new folder, replace text and demos, add a card in `index.html`.

## Edit names
Team: Gor (Գոռ), Aram (Արամ), Artur (Արթուր). Names appear on the home page cards.

## Publish
Any static host: GitHub Pages, Vercel, Netlify (upload the folder as is).
