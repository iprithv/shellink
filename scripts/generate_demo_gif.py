#!/usr/bin/env python3
"""
Build a stylized demo.gif for the README (terminal-ish preview).
Run from repo root: python3 scripts/generate_demo_gif.py
"""

from __future__ import annotations

import os
import os.path
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "demo.gif"

W, H = 960, 560
BG = "#0d1117"
MARGIN = 44


def pick_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Monaco.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Supplemental/Courier New.ttf",
        "/Library/Fonts/Menlo.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    ]
    for p in candidates:
        if os.path.isfile(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def text_block(
    draw: ImageDraw.ImageDraw,
    font: ImageFont.ImageFont,
    lines: list[tuple[str, str | None]],
    y: int,
) -> int:
    line_h = int(font.size * 1.35) if hasattr(font, "size") else 18
    x = MARGIN
    for text, color in lines:
        fill = color or "#c9d1d9"
        draw.text((x, y), text, font=font, fill=fill)
        y += line_h
    return y


def frame_intro(font_mono: ImageFont.ImageFont, _t: ImageFont.ImageFont) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    text_block(
        draw,
        font_mono,
        [
            ("$ cd shellink && node card.js", "#58a6ff"),
        ],
        36,
    )
    return img


def frame_card(font_mono: ImageFont.ImageFont, _t: ImageFont.ImageFont) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    # faux window bar
    draw.rounded_rectangle((24, 28, W - 24, 88), radius=10, outline="#30363d", width=2)
    # traffic lights
    for cx, col in ((44, "#ff5f56"), (66, "#ffbd2e"), (88, "#27ca40")):
        draw.ellipse((cx - 6, 46, cx + 6, 58), fill=col)
    y = 110
    text_block(
        draw,
        font_mono,
        [
            ("  Hey, I'm Prithvi S  @iprithv", "#56d364"),
            ("  open source enthusiast · search · AI · data", "#8b949e"),
            ("", None),
            ("  ·  ·  ·  ✦  ·  ·  ·", "#484f58"),
            ("", None),
            ("  Staff Software Engineer @ Cloudera", "#b1bac4"),
            ("", None),
            ("  Happy to connect with curious humans.", "#ffa657"),
            ("  Let's talk about search, LLMs,", "#39c5cf"),
            (
                "  and the messy, fun parts of shipping AI & data systems in production.",
                "#8b949e",
            ),
        ],
        y,
    )
    # frame border hint (purple)
    draw.rounded_rectangle((MARGIN - 12, 96, W - MARGIN + 12, H - 120), radius=14, outline="#8957e5", width=3)
    return img


def frame_menu(font_mono: ImageFont.ImageFont, frame: int) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    y = 36
    y = text_block(
        draw,
        font_mono,
        [
            ("▸ What would you like to do?  ↑↓ enter", "#3fb950"),
        ],
        y,
    )
    y += 12
    items = [
        "  Send me an email?",
        "  Download my Resume?",
        "  Schedule a 30-min meeting (Calendly)?",
        "  Open my portfolio?",
        "  Connect on LinkedIn?",
        "  View my work on GitHub?",
        "  Research & papers on Google Scholar?",
        "  Read my blog on DEV?",
        "  — leave —",
        "  Quit — exit and return to the shell",
    ]
    # Highlight row moves: 0 .. 3 .. 9
    hi = (frame % 4)
    hi_map = {0: 1, 1: 3, 2: 7, 3: 10}
    active = hi_map.get(hi, 1)
    for i, line in enumerate(items):
        color = "#f0f6fc"
        prefix = "   "
        if i + 1 == active:
            color = "#79c0ff"
            prefix = " ❯ "
        draw.text((MARGIN, y), prefix + line.strip(), font=font_mono, fill=color)
        y += int(font_mono.size * 1.2) if hasattr(font_mono, "size") else 20
    return img


def frame_bye(font_mono: ImageFont.ImageFont) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    text_block(
        draw,
        font_mono,
        [
            ("✓ Thanks for stopping by. See you around.", "#3fb950"),
        ],
        H // 2 - 20,
    )
    return img


def main() -> None:
    font_mono = pick_font(16)
    font_title = pick_font(20)
    frames: list[Image.Image] = []
    durations: list[int] = []

    def push(im: Image.Image, ms: int) -> None:
        frames.append(im)
        durations.append(ms)

    push(frame_intro(font_mono, font_title), 700)
    push(frame_card(font_mono, font_title), 1600)
    for i in range(6):
        push(frame_menu(font_mono, i), 400)
    push(frame_bye(font_mono), 1400)

    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=False,
    )
    print(f"Wrote {OUT} ({len(frames)} frames)")


if __name__ == "__main__":
    main()
