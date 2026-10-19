// Build-time processing of the animated logo GIF: trims the empty canvas
// around the lettering and produces light WebP/PNG variants.
import sharp from 'sharp';
import { logoFile, works } from './content';

const PAPER = '#fbf5ec';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

let boxPromise: Promise<{ box: Box; pages: number }> | undefined;

/** Union of the non-transparent area across every frame (the flea jumps around). */
function logoBox() {
  boxPromise ??= (async () => {
    const meta = await sharp(logoFile).metadata();
    const pages = meta.pages ?? 1;
    let [x0, y0, x1, y1] = [Infinity, Infinity, -1, -1];
    for (let page = 0; page < pages; page++) {
      const { data, info } = await sharp(logoFile, { page })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (let y = 0; y < info.height; y += 2) {
        for (let x = 0; x < info.width; x += 2) {
          if (data[(y * info.width + x) * 4 + 3] > 16) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
    }
    const w = meta.width!;
    const h = meta.pageHeight ?? meta.height!;
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
    const left = Math.max(0, x0 - pad);
    const top = Math.max(0, y0 - pad);
    const box = {
      left,
      top,
      width: Math.min(w, x1 + pad) - left,
      height: Math.min(h, y1 + pad) - top,
    };
    return { box, pages };
  })();
  return boxPromise;
}

export async function logoSize(width: number) {
  const { box } = await logoBox();
  return { width, height: Math.round((box.height / box.width) * width) };
}

export async function logoAnimated(width = 480) {
  const { box } = await logoBox();
  return sharp(logoFile, { pages: -1 }).extract(box).resize(width).webp({ quality: 85 }).toBuffer();
}

/** Last frame of the animation, for reduced-motion users and icons. */
async function logoStill(width: number) {
  const { box, pages } = await logoBox();
  return sharp(logoFile, { page: pages - 1 }).extract(box).resize(width).png().toBuffer();
}

export async function logoStatic(width = 480) {
  return sharp(await logoStill(width)).webp({ quality: 85 }).toBuffer();
}

export async function icon(size: number) {
  const inner = Math.round(size * 0.78);
  const logo = await sharp(await logoStill(inner))
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: PAPER } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
}

const rounded = (size: number, radius: number) =>
  Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}"/></svg>`);

/** 1200×630 social card: the logo next to two recent illustrations. */
export async function socialCard() {
  const W = 1200;
  const H = 630;
  const tile = 290;
  const logoWidth = 420;
  const gap = 24;
  const left = Math.round((W - (logoWidth + 60 + 2 * tile + gap)) / 2);
  const logo = await sharp(await logoStill(logoWidth)).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const tiles = await Promise.all(
    works.slice(0, 2).map((art) =>
      sharp(art.abs, { page: 0 })
        .resize(tile, tile, { fit: 'cover' })
        .composite([{ input: rounded(tile, 28), blend: 'dest-in' }])
        .png()
        .toBuffer(),
    ),
  );
  const top = Math.round((H - tile) / 2);
  return sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
    .composite([
      { input: logo, left, top: Math.round((H - logoMeta.height!) / 2) },
      ...tiles.map((input, i) => ({
        input,
        left: left + logoWidth + 60 + i * (tile + gap),
        top: top + (i ? 24 : -24),
      })),
    ])
    .jpeg({ quality: 86 })
    .toBuffer();
}
