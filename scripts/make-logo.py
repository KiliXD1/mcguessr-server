"""Erzeugt das MCGuessr-Logo (Minecraft-Block-Globus mit Marker) in allen Größen.

Nutzung (im Repo-Root):  python scripts/make-logo.py
Braucht:                 pip install pillow

Schreibt images/logo.svg (Quelle), logo.png/webp, Favicons, Apple-Touch-Icon
und die PWA-Icons (icons/icon-192.png, icons/icon-512.png).
"""
from pathlib import Path
from PIL import Image, ImageDraw

WWW = Path(__file__).resolve().parent.parent / "mcguessr-app" / "wwwroot"
IMAGES = WWW / "images"
ICONS = WWW / "icons"

# --- Geometrie (isometrischer Würfel, 4x4 Blöcke pro Seite) -----------------
CX, Y0, W, H, N = 128, 84, 24, 12, 4
WATER, LAND = (0x3A, 0x7B, 0xD5), (0x5A, 0xA8, 0x3C)
EDGE, PIN, PIN_EDGE = (0x0B, 0x16, 0x36), (0xFF, 0x3B, 0x3B), (0x5A, 0x0F, 0x0F)
BG = (0x14, 0x14, 0x2A)
TOP = ["WWGG", "WGGW", "GGWW", "WGWW"]
LEFT = ["WWWG", "WGGG", "WGGW", "WWWW"]
RIGHT = ["GGWW", "GGGW", "WWGG", "WWWW"]
VIEW = (8, 40, 240)  # x, y, Größe des quadratischen Ausschnitts


def shade(rgb, f):
    return tuple(int(v * f) for v in rgb)


def faces():
    """Liefert (Polygon, Farbe) für alle Blöcke."""
    c = lambda ch: LAND if ch == "G" else WATER
    for r in range(N):
        for k in range(N):
            x, y = CX + (k - r) * W, Y0 + (k + r) * H
            yield [(x, y), (x + W, y + H), (x, y + 2 * H), (x - W, y + H)], c(TOP[r][k])
    for k in range(N):
        for i in range(N):
            x, y = CX - 4 * W + i * W, Y0 + 4 * H + i * H + k * 2 * H
            yield [(x, y), (x + W, y + H), (x + W, y + 3 * H), (x, y + 2 * H)], shade(c(LEFT[k][i]), .78)
    for k in range(N):
        for i in range(N):
            x, y = CX + i * W, Y0 + 8 * H - i * H + k * 2 * H
            yield [(x, y), (x + W, y - H), (x + W, y + H), (x, y + 2 * H)], shade(c(RIGHT[k][i]), .58)


T, R, L, B = (CX, Y0), (CX + 4 * W, Y0 + 4 * H), (CX - 4 * W, Y0 + 4 * H), (CX, Y0 + 8 * H)
Rb, Lb, Bb = (R[0], R[1] + 96), (L[0], L[1] + 96), (B[0], B[1] + 96)
PX, PY = CX, Y0 + 48


def hexc(rgb):
    return "#%02x%02x%02x" % rgb


def write_svg(path: Path):
    pts = lambda *p: " ".join(f"{x},{y}" for x, y in p)
    o = [f'<polygon points="{pts(*p)}" fill="{hexc(c)}" stroke="{hexc(c)}" stroke-width="0.7"/>' for p, c in faces()]
    e = hexc(EDGE)
    o.append(f'<polygon points="{pts(T, R, Rb, Bb, Lb, L)}" fill="none" stroke="{e}" stroke-width="5" stroke-linejoin="round"/>')
    o.append(f'<polyline points="{pts(L, B, R)}" fill="none" stroke="{e}" stroke-width="4" stroke-linejoin="round"/>')
    o.append(f'<line x1="{B[0]}" y1="{B[1]}" x2="{Bb[0]}" y2="{Bb[1]}" stroke="{e}" stroke-width="4"/>')
    o.append(f'<path d="M{PX} {PY} L{PX-22} {PY-36} A26 26 0 1 1 {PX+22} {PY-36} Z" fill="{hexc(PIN)}" stroke="{hexc(PIN_EDGE)}" stroke-width="5" stroke-linejoin="round"/>')
    o.append(f'<circle cx="{PX}" cy="{PY-56}" r="11" fill="#fff"/>')
    vx, vy, vs = VIEW
    path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx} {vy} {vs} {vs}" width="512" height="512">{"".join(o)}</svg>', encoding="utf-8")


def render(size=1024, background=None, margin=0.0) -> Image.Image:
    """Zeichnet das Logo mit PIL (ohne Cairo), 2x überabgetastet."""
    ss = 2
    px = size * ss
    vx, vy, vs = VIEW
    inner = 1 - 2 * margin
    k = px / vs * inner
    ox, oy = px * margin - vx * k, px * margin - vy * k
    t = lambda p: (ox + p[0] * k, oy + p[1] * k)
    im = Image.new("RGBA", (px, px), background + (255,) if background else (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for poly, col in faces():
        d.polygon([t(p) for p in poly], fill=col + (255,), outline=col + (255,))
    d.polygon([t(p) for p in (T, R, Rb, Bb, Lb, L)], outline=EDGE + (255,), width=round(5 * k))
    line = lambda pts, w: d.line([t(p) for p in pts], fill=EDGE + (255,), width=round(w * k), joint="curve")
    line((L, B, R), 4)
    line((B, Bb), 4)
    # Pin: Dreieck + Kreis (Kontur zuerst als größere Form, dann Füllung)
    pin_c, pin_r = (PX, PY - 36 - 13.9), 26
    tri = [(PX, PY), (PX - 22, PY - 36), (PX + 22, PY - 36)]
    for grow, col in ((2.5, PIN_EDGE), (0, PIN)):
        cc, rr = t(pin_c), (pin_r + grow) * k
        d.ellipse([cc[0] - rr, cc[1] - rr, cc[0] + rr, cc[1] + rr], fill=col + (255,))
        cx_, cy_ = PX, PY
        big = [(cx_ + (x - cx_) * (1 + grow / 30) , cy_ + (y - cy_) * (1 + grow / 30)) for x, y in tri]
        d.polygon([t(p) for p in big], fill=col + (255,))
    wc, wr = t((PX, PY - 56)), 11 * k
    d.ellipse([wc[0] - wr, wc[1] - wr, wc[0] + wr, wc[1] + wr], fill=(255, 255, 255, 255))
    return im.resize((size, size), Image.LANCZOS)


def main():
    ICONS.mkdir(exist_ok=True)
    write_svg(IMAGES / "logo.svg")

    base = render(1024)
    base.resize((512, 512), Image.LANCZOS).save(IMAGES / "logo.png")
    base.resize((256, 256), Image.LANCZOS).save(IMAGES / "logo.webp", "WEBP", quality=90, method=6)

    for s in (16, 32):
        render(256).resize((s, s), Image.LANCZOS).save(WWW / f"favicon-{s}.png")
    render(256).save(WWW / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    # Apple/PWA-Icons: voller Hintergrund (iOS füllt Transparenz schwarz) + Rand
    render(180, BG, 0.1).save(WWW / "apple-touch-icon.png")
    render(192, BG, 0.1).save(ICONS / "icon-192.png")
    render(512, BG, 0.1).save(ICONS / "icon-512.png")
    # Maskable: größerer Sicherheitsrand, damit Android-Masken nichts abschneiden
    render(512, BG, 0.2).save(ICONS / "icon-maskable-512.png")
    print("fertig")


if __name__ == "__main__":
    main()
