# `res/crochet/` — photo folders

This is where the crochet photos live. The gallery page
(`SpellSpunThreads/index.html`) reads from here.

## Folder naming

Each crochet is **one folder** named `<number>_<title>`:

```
res/crochet/
  1_star/
  2_heart/
  3_amigurumi_cat/
```

- **`<number>`** sets the display order (1, 2, 3 …).
- **`<title>`** is everything after the first `_`. Underscores become
  spaces, so `3_amigurumi_cat` → **“Amigurumi Cat”**.

## Photos inside a folder

Put the photos **directly inside** the folder, named by order:

```
res/crochet/1_star/
  1.png
  2.jpeg
  3.webp
```

- The leading number sets photo order (`1`, `2`, `3` …).
- Any image extension works: `jpg`, `jpeg`, `png`, `webp`, `gif`,
  `avif`, `bmp`, `heic`, `heif`, `svg`, `tiff`.
- **Portrait and landscape** are both fine — the gallery keeps each
  photo’s natural aspect ratio (masonry layout) and the lightbox
  fits it to the screen.

## Two ways to publish

**A) Just push (auto-detected).** Commit the folders and push. The page
queries the GitHub API to discover them automatically. No extra files
needed. (Subject to GitHub’s unauthenticated API rate limit — fine for a
personal gallery, and results are cached in the browser for 1 hour.)

**B) Generate a manifest (most reliable).** Run this before pushing:

```bash
python tools/gen-manifest.py      # Python (no extra install needed)
# or
node tools/gen-manifest.mjs       # Node.js
```

It scans this folder and writes `manifest.json`. Commit that file too.
The page then loads from `manifest.json` with **no API calls** — works
offline, on GitHub Pages, and never hits rate limits.

> Tip: use (B) once you’re happy with the set, and re-run it whenever
> you add or remove photos.
