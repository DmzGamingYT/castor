#!/usr/bin/env python3
"""Génère l'icône Castor « document » (carré crème, contour + 7 lignes)
dans la palette papier & encre de l'app. Sorties :
  desktop/build/icon.svg        — source SVG (lisible, versionnable)
  desktop/build/icon.png        — 1024×1024 (Linux / Windows via electron-builder)
  desktop/build/icon.icns       — macOS (via iconutil)
  desktop/build/icon.ico        — Windows (PNG embarqués, 16/32/48/256)

Aucune dépendance externe : rendu par signed-distance fields + anti-aliasing.
Usage : python3 desktop/scripts/gen-icon.py
"""
import math
import os
import shutil
import struct
import subprocess
import sys
import zlib

# Les consoles Windows / GitHub Actions peuvent être codées en CP1252 :
# force l'UTF-8 pour que les print() accentués n'échouent pas à l'étape icône.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")

SIZE = 1024
BG = (250, 246, 236, 255)  # --bg papier
INK = (124, 120, 96, 255)  # --muted olive-gris


# ---------- PNG (RGBA, stdlib) ----------
def png_bytes(w, h, rows):
    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    raw = b"".join(b"\x00" + row for row in rows)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


# ---------- SDF ----------
def sd_round_box(px, py, hx, hy, r):
    qx = abs(px) - (hx - r)
    qy = abs(py) - (hy - r)
    ax, ay = max(qx, 0.0), max(qy, 0.0)
    return math.hypot(ax, ay) + min(max(qx, qy), 0.0) - r


def sd_segment(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    l2 = vx * vx + vy * vy
    t = 0.0 if l2 == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / l2))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


# ---------- rendu ----------
def render(size):
    s = float(size)
    m = 0.060 * s  # marge autour du carré
    b = s / 2 - m  # demi-côté
    rad = 0.185 * s  # arrondi du carré
    bw = 0.011 * s  # épaisseur du contour
    tl = 0.013 * s  # épaisseur des lignes
    ll = 0.580 * s  # longueur des lignes
    y0 = 0.285 * s  # première ligne (7 lignes sur 43 % de hauteur, centrées)
    step = 0.430 * s / 6
    cx = cy = s / 2
    half = tl / 2
    lines = [(cx - ll / 2, y0 + k * step, cx + ll / 2, y0 + k * step) for k in range(7)]
    rows = []
    for j in range(size):
        py = j + 0.5
        row = bytearray()
        for i in range(size):
            px = i + 0.5
            d_box = sd_round_box(px - cx, py - cy, b, b, rad)
            # anneau entièrement à l'intérieur du carré (visible)
            d = abs(d_box + bw / 2) - bw / 2
            for ax, ay, bx, by in lines:
                d = min(d, sd_segment(px, py, ax, ay, bx, by) - half)
            a_ink = max(0.0, min(1.0, 0.5 - d))
            a_box = max(0.0, min(1.0, 0.5 - d_box))
            r = int(BG[0] + (INK[0] - BG[0]) * a_ink + 0.5)
            g = int(BG[1] + (INK[1] - BG[1]) * a_ink + 0.5)
            bl = int(BG[2] + (INK[2] - BG[2]) * a_ink + 0.5)
            row += bytes((r, g, bl, int(255 * a_box + 0.5)))
        rows.append(bytes(row))
    return png_bytes(size, size, rows)


# ---------- ICO (PNG embarqués) ----------
def ico_bytes(pngs):
    header = struct.pack("<HHH", 0, 1, len(pngs))
    entries = b""
    offset = 6 + 16 * len(pngs)
    for (w, h, data) in pngs:
        entries += struct.pack(
            "<BBBBHHII", w % 256, h % 256, 0, 0, 1, 32, len(data), offset
        )
        offset += len(data)
    return header + entries + b"".join(d for (_, _, d) in pngs)


def main():
    os.makedirs(BUILD, exist_ok=True)

    master = render(SIZE)
    with open(os.path.join(BUILD, "icon.png"), "wb") as f:
        f.write(master)
    print("✓ build/icon.png (1024×1024)")

    # .iconset → .icns
    iconset = os.path.join(BUILD, "icon.iconset")
    os.makedirs(iconset, exist_ok=True)
    sizes = [16, 32, 64, 128, 256, 512, 1024]
    names = [
        "icon_16x16.png",
        "icon_16x16@2x.png",
        "icon_32x32.png",
        "icon_32x32@2x.png",
        "icon_128x128.png",
        "icon_128x128@2x.png",
        "icon_256x256.png",
        "icon_256x256@2x.png",
        "icon_512x512.png",
        "icon_512x512@2x.png",
    ]
    for name, size in zip(names, sizes):
        with open(os.path.join(iconset, name), "wb") as f:
            f.write(render(size))
    if shutil.which("iconutil"):
        subprocess.run(
            ["iconutil", "-c", "icns", iconset, "-o", os.path.join(BUILD, "icon.icns")],
            check=True,
        )
        print("✓ build/icon.icns (macOS)")
    else:
        print("ℹ iconutil absent — icon.icns généré uniquement sur macOS")
    shutil_rmtree(iconset)

    # .ico
    ico = ico_bytes([(w, w, render(w)) for w in (16, 32, 48, 256)])
    with open(os.path.join(BUILD, "icon.ico"), "wb") as f:
        f.write(ico)
    print("✓ build/icon.ico (Windows)")

    # source SVG (même géométrie, pour lecture / favicon)
    ys = [0.285 * 24 + k * (0.430 * 24 / 6) for k in range(7)]  # 6.84 → 17.16
    lines = "".join(f'<path d="M5.04 {y:.2f}h13.92"/>' for y in ys)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n'
        '  <rect x="1.44" y="1.44" width="21.12" height="21.12" rx="4.44"\n'
        '        fill="#faf6ec" stroke="#7c7860" stroke-width="0.27"/>\n'
        f'  <g stroke="#7c7860" stroke-width="0.31" stroke-linecap="round">{lines}</g>\n'
        "</svg>\n"
    )
    with open(os.path.join(BUILD, "icon.svg"), "w") as f:
        f.write(svg)
    print("✓ build/icon.svg")


def shutil_rmtree(path):
    shutil.rmtree(path, ignore_errors=True)


if __name__ == "__main__":
    main()
