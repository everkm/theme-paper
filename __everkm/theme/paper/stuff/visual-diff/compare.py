#!/usr/bin/env python3
"""Compare production vs local paper theme screenshots + computed styles."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

REMOTE = "https://paper.theme.everkm.com"
LOCAL = "http://localhost:9081"
OUT = Path(__file__).resolve().parent / "out"
VIEWPORT = {"width": 1280, "height": 800}

PAGES = [
    ("home", "/"),
    ("about", "/about/"),
    ("archives", "/archives/"),
    ("tags", "/tags/"),
    ("post", "/posts/getting-started-with-paper-b00da9cc815c.html"),
]

STYLE_SELECTORS = [
    ("html", "html"),
    ("body", "body"),
    ("header a", "header a"),
    ("h1", "h1"),
    ("main a", "main a"),
    ("prose p", ".app-prose p, main p"),
    ("prose code", ".app-prose :not(pre) > code, main :not(pre) > code"),
    ("footer", "footer"),
]

STYLE_PROPS = [
    "color",
    "backgroundColor",
    "fontSize",
    "fontFamily",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "textDecoration",
    "borderRadius",
    "paddingTop",
    "paddingBottom",
    "marginTop",
    "marginBottom",
    "maxWidth",
    "opacity",
    "boxShadow",
    "outlineWidth",
    "outlineStyle",
    "borderTopWidth",
    "borderColor",
]


def ensure_out():
    OUT.mkdir(parents=True, exist_ok=True)
    for sub in ("remote", "local", "diff"):
        (OUT / sub).mkdir(exist_ok=True)


def shot_and_styles(page, url: str, theme: str):
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.evaluate(
        """(theme) => {
          localStorage.setItem('theme', theme);
          document.documentElement.setAttribute('data-theme', theme);
          const meta = document.querySelector("meta[name='theme-color']");
          // trigger any theme listeners if present
          window.dispatchEvent(new Event('storage'));
        }""",
        theme,
    )
    page.wait_for_timeout(300)
    # full page screenshot
    png = page.screenshot(full_page=True, type="png")
    styles = page.evaluate(
        """({ selectors, props }) => {
          const out = {};
          for (const [name, sel] of selectors) {
            const el = document.querySelector(sel);
            if (!el) { out[name] = null; continue; }
            const cs = getComputedStyle(el);
            const o = {};
            for (const p of props) o[p] = cs[p];
            const r = el.getBoundingClientRect();
            o.__box = { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
            out[name] = o;
          }
          // body bg + accent CSS vars
          const root = getComputedStyle(document.documentElement);
          out.__vars = {
            background: root.getPropertyValue('--background').trim(),
            foreground: root.getPropertyValue('--foreground').trim(),
            accent: root.getPropertyValue('--accent').trim(),
            muted: root.getPropertyValue('--muted').trim(),
            border: root.getPropertyValue('--border').trim(),
          };
          return out;
        }""",
        {"selectors": STYLE_SELECTORS, "props": STYLE_PROPS},
    )
    return png, styles


def save_png(data: bytes, path: Path):
    path.write_bytes(data)


def diff_images(a_path: Path, b_path: Path, out_path: Path) -> dict:
    a = Image.open(a_path).convert("RGB")
    b = Image.open(b_path).convert("RGB")
    # pad to same size
    w = max(a.width, b.width)
    h = max(a.height, b.height)

    def pad(im):
        canvas = Image.new("RGB", (w, h), (255, 255, 255))
        canvas.paste(im, (0, 0))
        return canvas

    a, b = pad(a), pad(b)
    arr_a = np.asarray(a, dtype=np.int16)
    arr_b = np.asarray(b, dtype=np.int16)
    delta = np.abs(arr_a - arr_b)
    # pixel considered different if any channel > 12
    mask = (delta.max(axis=2) > 12)
    changed = int(mask.sum())
    total = int(mask.size)
    pct = 100.0 * changed / total if total else 0.0

    # highlight diff in red overlay
    overlay = a.copy()
    draw = ImageDraw.Draw(overlay)
    # cheaper: paint changed pixels red on copy
    arr = np.asarray(overlay).copy()
    arr[mask] = (220, 40, 40)
    Image.fromarray(arr).save(out_path)

    return {"changed_pixels": changed, "total_pixels": total, "diff_pct": round(pct, 3), "size": [w, h]}


def style_diff(remote: dict, local: dict) -> dict:
    diffs = {}
    keys = set(remote) | set(local)
    for k in sorted(keys):
        if k.startswith("__") and k != "__vars":
            continue
        r, l = remote.get(k), local.get(k)
        if r == l:
            continue
        if r is None or l is None:
            diffs[k] = {"remote": r, "local": l}
            continue
        field_diffs = {}
        for f in set(r) | set(l):
            if r.get(f) != l.get(f):
                field_diffs[f] = {"remote": r.get(f), "local": l.get(f)}
        if field_diffs:
            diffs[k] = field_diffs
    return diffs


def main():
    ensure_out()
    report = {"pages": []}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, device_scale_factor=1)
        page = context.new_page()

        for theme in ("light", "dark"):
            for name, path in PAGES:
                key = f"{name}-{theme}"
                print(f"==> {key}", flush=True)
                try:
                    r_png, r_styles = shot_and_styles(page, REMOTE + path, theme)
                    l_png, l_styles = shot_and_styles(page, LOCAL + path, theme)
                except Exception as e:
                    print(f"  FAIL: {e}", flush=True)
                    report["pages"].append({"key": key, "error": str(e)})
                    continue

                r_path = OUT / "remote" / f"{key}.png"
                l_path = OUT / "local" / f"{key}.png"
                d_path = OUT / "diff" / f"{key}.png"
                save_png(r_png, r_path)
                save_png(l_png, l_path)
                img = diff_images(r_path, l_path, d_path)
                sdiff = style_diff(r_styles, l_styles)
                entry = {
                    "key": key,
                    "path": path,
                    "theme": theme,
                    "image": img,
                    "style_diff_keys": list(sdiff.keys()),
                    "style_diff": sdiff,
                    "vars": {"remote": r_styles.get("__vars"), "local": l_styles.get("__vars")},
                }
                report["pages"].append(entry)
                print(
                    f"  diff={img['diff_pct']}% style_keys={list(sdiff.keys())}",
                    flush=True,
                )

        browser.close()

    out_json = OUT / "report.json"
    out_json.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"\nReport: {out_json}", flush=True)

    # summary
    print("\n=== SUMMARY ===")
    for e in report["pages"]:
        if "error" in e:
            print(f"{e['key']}: ERROR {e['error']}")
        else:
            print(f"{e['key']}: {e['image']['diff_pct']}%  styles={e['style_diff_keys']}")


if __name__ == "__main__":
    main()
