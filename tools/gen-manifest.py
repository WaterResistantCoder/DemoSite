#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════
#  SpellSpun Threads — manifest generator (Python)
#  Scans res/crochet/ and writes res/crochet/manifest.json so
#  the gallery loads with zero API calls (reliable on GitHub
#  Pages, offline, and any static server). Run after adding
#  photos:
#
#      python tools/gen-manifest.py
# ═══════════════════════════════════════════════════════════
import json
import re
import sys
from pathlib import Path

# Windows consoles default to cp1252; force UTF-8 so checkmark/warning glyphs print.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent.parent
CROCHET_DIR = ROOT / "res" / "crochet"
OUT = CROCHET_DIR / "manifest.json"

IMG_EXT = {
    "jpg", "jpeg", "png", "webp", "gif", "avif",
    "bmp", "heic", "heif", "svg", "tiff", "tif", "phn",
}
DIR_RE = re.compile(r"^(\d+)_(.*)$")


def lead_num(name: str):
    m = re.match(r"^\s*(\d+)", name)
    return int(m.group(1)) if m else float("inf")


def title_case(s: str) -> str:
    s = re.sub(r"[_-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return " ".join(w[0].upper() + w[1:].lower() for w in s.split() if w)


def main():
    if not CROCHET_DIR.is_dir():
        print(f"✗ Folder not found: {CROCHET_DIR}")
        sys.exit(1)

    collections = []
    for entry in sorted(CROCHET_DIR.iterdir()):
        if not entry.is_dir():
            continue
        m = DIR_RE.match(entry.name)
        if not m:
            print(f'  ⚠ skipping "{entry.name}" (does not match <number>_<title>)')
            continue
        order = int(m.group(1))
        title = title_case(m.group(2)) or entry.name
        files = [
            f.name for f in entry.iterdir()
            if f.is_file() and f.suffix.lower().lstrip(".") in IMG_EXT
        ]
        files.sort(key=lambda n: (lead_num(n), n))
        if not files:
            print(f'  ⚠ "{entry.name}" has no images — skipped')
            continue
        collections.append({"dir": entry.name, "order": order, "title": title, "images": files})

    collections.sort(key=lambda c: (c["order"], c["dir"]))
    OUT.write_text(json.dumps(collections, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    photos = sum(len(c["images"]) for c in collections)
    print(f"✓ Wrote {OUT}")
    print(f"  {len(collections)} collection{'s' if len(collections) != 1 else ''}, "
          f"{photos} photo{'s' if photos != 1 else ''}")
    for c in collections:
        print(f"    {str(c['order']).rjust(2)}  {c['title'].ljust(18)} {len(c['images'])} photo(s)")
    if not collections:
        print('  (empty — add folders like res/crochet/1_star/ with photos inside)')


if __name__ == "__main__":
    main()
