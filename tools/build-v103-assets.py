"""Mechanical export of the approved Figma bitmaps. No creative repainting."""
from pathlib import Path
from PIL import Image
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/v1.0.3'
OUT = ROOT / 'minigame/assets/v103'
OUT.mkdir(parents=True, exist_ok=True)
LEGACY = ROOT / 'assets/legacy-v102'
LEGACY.mkdir(parents=True, exist_ok=True)
# Known former renderer assets only; all are preserved outside the runtime package.
for p in (ROOT / 'minigame/assets').glob('*'):
    if p.is_file():
        target = LEGACY / p.name
        if not target.exists():
            shutil.copy2(p, target)
        if target.read_bytes() != p.read_bytes():
            raise RuntimeError('Archive differs: ' + str(p))
        p.unlink()

def png(im, name, size):
    im = im.convert('RGBA')
    im.thumbnail(size, Image.Resampling.LANCZOS)
    im.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(OUT / name, optimize=True)

bg = Image.open(SOURCE / 'background-approved.png').convert('RGB')
bg.resize((804, 1700), Image.Resampling.LANCZOS).save(OUT / 'background.jpg', quality=88, optimize=True)
atlas = Image.open(SOURCE / 'food-approved-atlas.png')
png(atlas, 'food-atlas.png', (1024, 768))
png(Image.open(SOURCE / 'har-gow.png'), 'har-gow.png', (320, 320))
for extra in sorted((SOURCE / 'food-expanded').glob('*.png')):
    if extra.name != 'piggy-custard-bun.png':
        png(Image.open(extra), 'food-' + extra.name, (256, 256))
png(Image.open(SOURCE / 'piggy-custard-bun-whole.png'), 'food-piggy-custard-bun.png', (256, 256))
png(Image.open(SOURCE / 'steamer-approved.png'), 'steamer.png', (360, 420))
png(Image.open(SOURCE / 'auntie-stamp-card.png'), 'auntie-serving.png', (400, 470))
# User-updated Figma assets, 2026-10-19; preserve exported crop and shelf geometry.
USER_FIGMA = SOURCE / 'user-figma-20261019'
png(Image.open(USER_FIGMA / 'chassis-source.png'), 'chassis.png', (1206, 804))
png(Image.open(USER_FIGMA / 'tray-board.png'), 'tray-board.png', (752, 216))
png(Image.open(USER_FIGMA / 'steamer.png'), 'steamer.png', (360, 420))
png(Image.open(LEGACY / 'wood-tray.png'), 'wood.png', (800, 400))
png(Image.open(LEGACY / 'rules-base.png'), 'button.png', (200, 200))
png(Image.open(LEGACY / 'level-plaque.png'), 'plaque.png', (360, 150))
icons = Image.open(LEGACY / 'icon-sheet.png').convert('RGBA')
# Same clipped crop as original Figma book icon.
x0, y0 = 1.1876 / 3.3699, 3.0513 / 4.1494
book = icons.crop((round(icons.width*x0), round(icons.height*y0), round(icons.width*(x0+1/3.3699)), round(icons.height*(y0+1/4.1494))))
png(book, 'book.png', (90, 78))
# Existing Figma tool exports stay byte-identical; no image recompression or redraw.
for tool in (SOURCE / 'figma-tools').glob('tool-*.png'):
    shutil.copy2(tool, OUT / tool.name)
print('Runtime artwork:', sum(p.stat().st_size for p in OUT.iterdir()), 'bytes')
