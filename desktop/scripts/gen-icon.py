#!/usr/bin/env python3
"""Génère l'icône Castor « castor de chantier » (tuile ambrée embossée +
castor au casque jaune tenant un marteau) dans la palette papier & encre.
Sorties :
  desktop/build/icon.svg        — copie de src/icon.svg (source SVG lisible)
  desktop/build/icon.png        — 1024×1024 (Linux / Windows via electron-builder)
  desktop/build/icon.icns       — macOS (via iconutil)
  desktop/build/icon.ico        — Windows (PNG embarqués, 16/32/48/256)

Aucune dépendance externe : rendu par signed-distance fields + anti-aliasing,
même géométrie que src/icon.svg (le SVG de référence, versionnable).
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
ICON_SRC = os.path.join(ROOT, "src", "icon.svg")

SIZE = 1024

# ---------- palette (design 128 × 128, même géométrie que src/icon.svg) ----------
TILE_TOP = (247, 198, 102)     # #f7c666
TILE_BOT = (226, 149, 42)      # #e2952a
VIGNETTE = (92, 58, 8)         # #5c3a08
BORDER = (138, 90, 18)         # #8a5a12 (opacité 0.35)
FUR_TOP = (107, 74, 20)        # #6b4a14
FUR_BOT = (61, 40, 8)          # #3d2808
BELLY_TOP = (255, 253, 246)    # #fffdf6
BELLY_BOT = (243, 233, 207)    # #f3e9cf
HAT_TOP = (255, 224, 113)      # #ffe071
HAT_BOT = (239, 182, 58)       # #efb63a
TAIL = (74, 50, 16)            # #4a3210
TAIL_STRIPE = (51, 34, 10)     # #33220a
HANDLE = (201, 138, 43)        # #c98a2b
HEAD_DARK = (154, 165, 178)    # #9aa5b2
HEAD_LIGHT = (198, 206, 216)   # #c6ced8
EAR_INNER = (201, 136, 32)     # #c98820
BRIM = (227, 167, 47)          # #e3a72f
KNOB = (217, 154, 38)          # #d99a26
WHITE = (255, 253, 246)        # #fffdf6
DARK = (36, 19, 3)             # #241303
CHEEK = (226, 149, 42)         # #e2952a


# ---------- SDF ----------
def sd_round_box(px, py, hx, hy, r):
    qx = abs(px) - (hx - r)
    qy = abs(py) - (hy - r)
    ax, ay = max(qx, 0.0), max(qy, 0.0)
    return math.hypot(ax, ay) + min(max(qx, qy), 0.0) - r


def sd_circle(px, py, cx, cy, r):
    return math.hypot(px - cx, py - cy) - r


def sd_ellipse(px, py, a, b):
    """Distance signée à une ellipse centrée en (0,0), demi-axes a, b
    (formule d'Inigo Quilez, exacte pour la couverture AA)."""
    if a <= 0 or b <= 0:
        return math.hypot(px, py)
    pxx, pyy = abs(px), abs(py)
    if pxx > pyy:
        pxx, pyy = pyy, pxx
        a, b = b, a
    l = b * b - a * a
    m = a * pxx / l
    n = b * pyy / l
    m2, n2 = m * m, n * n
    c = (m2 + n2 - 1.0) / 3.0
    c3 = c * c * c
    q = c3 + m2 * n2 * 2.0
    d = c3 + m2 * n2
    g = m + m * n2
    sgn_l = 1.0 if l > 0 else -1.0
    if d < 0.0:
        h = math.acos(max(-1.0, min(1.0, q / c3))) / 3.0
        cs = math.cos(h)
        sn = math.sin(h) * math.sqrt(3.0)
        rx = math.sqrt(max(0.0, -c * (cs + sn + 2.0))) + m
        ry = math.sqrt(max(0.0, -c * (cs - sn + 2.0))) + m
        co = (ry + sgn_l * rx + abs(g) / (rx * ry) - m) / 2.0
    else:
        h = 2.0 * m * n * math.sqrt(d)
        s = math.copysign(abs(q + h) ** (1.0 / 3.0), q + h)
        u = math.copysign(abs(q - h) ** (1.0 / 3.0), q - h)
        rx = -(s + u) - c * 4.0 + 2.0
        ry = (s - u) * math.sqrt(3.0)
        rm = math.sqrt(rx * rx + ry * ry)
        p2 = ry / math.sqrt(max(rm - rx, 1e-9))
        co = (p2 + sgn_l * m - m) / 2.0
    si = math.sqrt(max(0.0, 1.0 - co * co))
    rxx, ryy = a * co, b * si
    return math.hypot(pxx - rxx, pyy - ryy) * (1.0 if pyy > ryy else -1.0)


def sd_segment(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    l2 = vx * vx + vy * vy
    t = 0.0 if l2 == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / l2))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


def sd_rot(px, py, cx, cy, ang):
    ca, sa = math.cos(ang), math.sin(ang)
    x, y = px - cx, py - cy
    return (x * ca + y * sa, -x * sa + y * ca)


def sd_dome(px, py, cx, cy, r):
    """Demi-cercle supérieur (casque) : cercle coupé à y <= cy."""
    return max(math.hypot(px - cx, py - cy) - r, py - cy)


def sd_stroke(d, w):
    return abs(d + w / 2) - w / 2


def clamp01(x):
    return 0.0 if x < 0 else (1.0 if x > 1 else x)


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)


# ---------- construction de la scène (design 128 × 128) ----------
def quad_segments(p0, c, p1, n=4):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        pts.append((mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0],
                    mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1]))
    return list(zip(pts[:-1], pts[1:]))


def build_scene(S):
    """Retourne la liste (d, color, opacity, bbox) des formes du castor,
    en coordonnées écran (design × S, avec le décalage y + 4 du SVG)."""
    D = 4.0 * S  # translate(0,4) du groupe castor

    def scl(*vals):
        return tuple(v * S for v in vals)

    def C(cx, cy, r, color, op=1.0):
        cx, cy, r = cx * S, cy * S + D, r * S
        bbox = (cx - r, cy - r, cx + r, cy + r)
        return (lambda px, py: sd_circle(px, py, cx, cy, r), color, op, bbox)

    def E(cx, cy, a, b, color, op=1.0, rot=0.0):
        cx, cy, a, b = cx * S, cy * S + D, a * S, b * S
        rad = math.radians(rot) if rot else 0.0
        rr = math.hypot(a, b)
        bbox = (cx - rr, cy - rr, cx + rr, cy + rr)
        if rot:
            def f(px, py):
                x, y = sd_rot(px, py, cx, cy, rad)
                return sd_ellipse(x, y, a, b)
        else:
            def f(px, py):
                return sd_ellipse(px - cx, py - cy, a, b)
        return (f, color, op, bbox)

    def R(cx, cy, hx, hy, r, color, op=1.0, rot=0.0, rcx=None, rcy=None):
        cx, cy, hx, hy, r = cx * S, cy * S + D, hx * S, hy * S, r * S
        rad = math.radians(rot) if rot else 0.0
        rr = math.hypot(hx, hy) + r
        bbox = (cx - rr, cy - rr, cx + rr, cy + rr)
        if rot:
            # rotation autour d'un pivot du groupe (sinon le centre de la forme)
            pcx = rcx * S if rcx is not None else cx
            pcy = rcy * S + D if rcy is not None else cy
            def f(px, py):
                x, y = sd_rot(px, py, pcx, pcy, rad)
                return sd_round_box(x, y, hx, hy, r)
        else:
            def f(px, py):
                return sd_round_box(px - cx, py - cy, hx, hy, r)
        return (f, color, op, bbox)

    def L(x1, y1, x2, y2, w, color, op=1.0, rot=0.0, rcx=0.0, rcy=0.0):
        x1, y1, x2, y2, w = scl(x1, y1 + D / S, x2, y2 + D / S, w)
        if rot:
            rad = math.radians(rot)
            x1, y1 = sd_rot(x1, y1, rcx * S, rcy * S + D, rad)
            x2, y2 = sd_rot(x2, y2, rcx * S, rcy * S + D, rad)
        bbox = (min(x1, x2) - w, min(y1, y2) - w, max(x1, x2) + w, max(y1, y2) + w)
        return (lambda px, py: sd_stroke(sd_segment(px, py, x1, y1, x2, y2), w), color, op, bbox)

    def Dm(cx, cy, r, color, op=1.0, stroke=None):
        cx, cy, r = cx * S, cy * S + D, r * S
        bbox = (cx - r, cy - r, cx + r, cy + r)
        if stroke:
            return (lambda px, py: sd_stroke(sd_dome(px, py, cx, cy, r), stroke * S), color, op, bbox)
        return (lambda px, py: sd_dome(px, py, cx, cy, r), color, op, bbox)

    scene = []

    # bord de la tuile (dessiné avant le castor, comme dans le SVG)
    scene.append(("ring", BORDER, 0.35, None))

    # queue (pagaie) + stries — groupe rot(-22 96 92)
    scene.append(E(96, 92, 23, 12, TAIL, rot=-22))
    scene.append(L(80, 90, 112, 90, 1.6, TAIL_STRIPE, 0.55, rot=-22, rcx=96, rcy=92))
    scene.append(L(80, 94, 112, 94, 1.6, TAIL_STRIPE, 0.55, rot=-22, rcx=96, rcy=92))

    # corps + ventre
    scene.append(E(62, 86, 30, 24, ("fur", FUR_TOP, FUR_BOT, 24.0, 114.0)))
    scene.append(E(57, 90, 18, 15, ("belly", BELLY_TOP, BELLY_BOT, 79.0, 109.0), 0.95))

    # marteau — groupe rot(-28 52 88)
    scene.append(R(54.5, 87.5, 8.5, 2.5, 2.5, HANDLE, rot=-28, rcx=52, rcy=88))
    scene.append(R(42, 87.5, 5, 8, 3, HEAD_DARK, rot=-28, rcx=52, rcy=88))
    scene.append(R(42, 82.25, 5, 2.75, 2.75, HEAD_LIGHT, rot=-28, rcx=52, rcy=88))

    # pattes qui tiennent le marteau
    scene.append(E(38, 88, 9, 7, TAIL, rot=-18))
    scene.append(E(70, 80, 9, 7, TAIL, rot=22))

    # tête
    scene.append(C(62, 50, 26, ("fur", FUR_TOP, FUR_BOT, 24.0, 114.0)))
    # oreilles
    scene.append(C(40, 28, 9, TAIL))
    scene.append(C(40, 28, 5.5, EAR_INNER, 0.75))
    scene.append(C(84, 28, 9, TAIL))
    scene.append(C(84, 28, 5.5, EAR_INNER, 0.75))
    # ombre sous le casque
    scene.append(E(62, 36, 20, 4.2, (0, 0, 0), 0.10))
    # casque de chantier
    scene.append(Dm(62, 35, 16.5, ("hat", HAT_TOP, HAT_BOT, 18.0, 42.0)))
    scene.append(E(62, 35, 22, 5.4, BRIM))
    scene.append(C(62, 17.8, 2.6, KNOB))
    scene.append(Dm(62, 24, 14, WHITE, 0.35, stroke=2.2))
    # yeux
    scene.append(E(50, 50, 7.5, 8.5, WHITE))
    scene.append(E(74, 50, 7.5, 8.5, WHITE))
    scene.append(C(51.6, 51, 4.6, DARK))
    scene.append(C(75.6, 51, 4.6, DARK))
    scene.append(C(53.2, 49.4, 1.7, WHITE, 0.95))
    scene.append(C(77.2, 49.4, 1.7, WHITE, 0.95))
    # nez
    scene.append(E(62, 60, 5.2, 4.2, DARK))
    # sourire (2 courbes quadratiques échantillonnées)
    smile = quad_segments((54.5, 64), (58, 67.5), (62, 64)) + \
        quad_segments((62, 64), (66, 67.5), (69.5, 64))
    for (ax, ay), (bx, by) in smile:
        scene.append(L(ax, ay, bx, by, 1.7, DARK))
    # dents
    scene.append(R(59.2, 67.75, 2.2, 3.25, 1.4, WHITE))
    scene.append(R(64.8, 67.75, 2.2, 3.25, 1.4, WHITE))
    # moustaches
    scene.append(L(34, 55, 46, 57, 1.1, WHITE, 0.55))
    scene.append(L(33, 60, 46, 60, 1.1, WHITE, 0.55))
    scene.append(L(34, 65, 46, 63, 1.1, WHITE, 0.55))
    scene.append(L(78, 57, 90, 55, 1.1, WHITE, 0.55))
    scene.append(L(78, 60, 91, 60, 1.1, WHITE, 0.55))
    scene.append(L(78, 63, 90, 65, 1.1, WHITE, 0.55))
    # joues
    scene.append(C(42, 64, 4.6, CHEEK, 0.40))
    scene.append(C(82, 64, 4.6, CHEEK, 0.40))

    return scene


def shape_color(spec, px, py, S):
    if isinstance(spec, tuple) and spec and spec[0] in ("fur", "belly", "hat"):
        _, top, bot, y0, y1 = spec
        t = clamp01(((py / S) - y0) / (y1 - y0))
        return lerp(top, bot, t)
    return spec


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


# ---------- rendu ----------
def render(size):
    s = float(size)
    S = s / 128.0
    cx = cy = s / 2
    b = 0.47 * s      # demi-côté de la tuile (marge 3 %)
    rad = 0.22 * s    # arrondi (rx=224 sur 1024, comme le SVG)
    bw = 0.011 * s    # épaisseur du contour
    scene = build_scene(S)
    tile_dx = cx
    rows = []
    for j in range(size):
        py = j + 0.5
        row = bytearray()
        for i in range(size):
            px = i + 0.5
            d_box = sd_round_box(px - cx, py - cy, b, b, rad)
            a_out = clamp01(0.5 - d_box)
            if a_out <= 0:
                row += bytes((0, 0, 0, 0))
                continue
            # tuile : dégradé diagonal
            t_tile = clamp01((px + py) / (2.0 * s))
            r, g, bl = lerp(TILE_TOP, TILE_BOT, t_tile)
            for shape in scene:
                kind, spec, op, bbox = shape
                if bbox is not None:
                    bx0, by0, bx1, by1 = bbox
                    if px < bx0 or px > bx1 or py < by0 or py > by1:
                        continue
                if kind == "ring":
                    d = sd_stroke(d_box, bw)
                    col = spec
                else:
                    d = shape[0](px, py)
                    col = shape_color(spec, px, py, S)
                a = clamp01(0.5 - d) * op
                if a > 0:
                    r = r + (col[0] - r) * a
                    g = g + (col[1] - g) * a
                    bl = bl + (col[2] - bl) * a
            # ombre interne (aspect embossé), plus marquée en bas
            edge = -d_box  # distance vers le bord intérieur de la tuile
            v = (1.0 - clamp01(edge / (0.13 * s))) ** 2
            v *= 0.30 * (0.55 + 0.45 * (py / s))
            if v > 0:
                r = r + (VIGNETTE[0] - r) * v
                g = g + (VIGNETTE[1] - g) * v
                bl = bl + (VIGNETTE[2] - bl) * v
            row += bytes((int(r + 0.5), int(g + 0.5), int(bl + 0.5), int(255 * a_out + 0.5)))
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
    shutil.rmtree(iconset, ignore_errors=True)

    # .ico
    ico = ico_bytes([(w, w, render(w)) for w in (16, 32, 48, 256)])
    with open(os.path.join(BUILD, "icon.ico"), "wb") as f:
        f.write(ico)
    print("✓ build/icon.ico (Windows)")

    # source SVG (copie de src/icon.svg — le dessin de référence)
    if os.path.exists(ICON_SRC):
        with open(ICON_SRC, "r", encoding="utf-8") as f:
            svg = f.read()
        with open(os.path.join(BUILD, "icon.svg"), "w", encoding="utf-8") as f:
            f.write(svg)
        print("✓ build/icon.svg (copie de src/icon.svg)")
    else:
        print(f"⚠ {ICON_SRC} introuvable — build/icon.svg non écrit")


if __name__ == "__main__":
    main()
