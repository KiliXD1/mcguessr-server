"""Erzeugt kleine WebP-Versionen aller Spielbilder neben den Originalen.

Nutzung (im Repo-Root):  python scripts/optimize-images.py
Braucht:                 pip install pillow

Originale (PNG/JPG) bleiben unangetastet - das Spiel verweist nur auf die
.webp-Dateien. Schon vorhandene, neuere .webp werden übersprungen, neue
Screenshots (z.B. nach dem Location-Picker) einfach nach dem Ablegen
nochmal laufen lassen und in der locations-JSON die Endung auf .webp ändern.
"""
from pathlib import Path
from PIL import Image

IMAGES = Path(__file__).resolve().parent.parent / "mcguessr-app" / "wwwroot" / "images"

SCREENSHOT_QUALITY = 82
MAP_QUALITY = 85
THUMB_WIDTH = 920  # .map-card ist 460px breit, 2x für Retina
THUMB_QUALITY = 80


def up_to_date(src: Path, dst: Path) -> bool:
    return dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime


def convert(src: Path, dst: Path, quality: int, max_width: int | None = None, rgba: bool = False):
    if up_to_date(src, dst):
        return
    im = Image.open(src)
    im = im.convert("RGBA" if rgba else "RGB")
    if max_width and im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)
    print(f"{src.relative_to(IMAGES)} -> {dst.name}  {src.stat().st_size // 1024} KB -> {dst.stat().st_size // 1024} KB")


def main():
    # Screenshots (Overworld: images/bildN.png, weitere Karten: images/<id>/*.png)
    for folder in [IMAGES, *[d for d in IMAGES.iterdir() if d.is_dir()]]:
        for src in sorted(folder.glob("*.png")):
            name = src.name.lower()
            if name == "map.png":
                convert(src, folder / "map.webp", MAP_QUALITY)
                convert(src, folder / "map-thumb.webp", THUMB_QUALITY, max_width=THUMB_WIDTH)
            elif folder == IMAGES and not name.startswith("bild"):
                continue  # UI-Grafiken werden unten gezielt behandelt
            else:
                convert(src, src.with_suffix(".webp"), SCREENSHOT_QUALITY)

    # UI-Grafiken: kleiner skaliert bzw. als WebP
    convert(IMAGES / "logo.png", IMAGES / "logo.webp", 85, max_width=256, rgba=True)
    convert(IMAGES / "Profilbild.png", IMAGES / "Profilbild.webp", 85, max_width=256, rgba=True)
    convert(IMAGES / "Button.jpg", IMAGES / "Button.webp", 80)
    convert(IMAGES / "Button-Multi.png", IMAGES / "Button-multi.webp", 80)


if __name__ == "__main__":
    main()
