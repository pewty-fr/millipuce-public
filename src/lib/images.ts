import { getImage } from 'astro:assets';
import sharp from 'sharp';
import type { Artwork } from './content';

export interface Rendition {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

async function rendition(art: Artwork, widths: number[], quality = 80): Promise<Rendition> {
  const { width, height } = art.image;
  // Never upscale: keep the widths below the original, plus the original itself.
  const usable = [...new Set([...widths.filter((w) => w < width), Math.min(width, Math.max(...widths))])];
  const img = await getImage({ src: art.image, widths: usable, format: 'webp', quality });
  return { src: img.src, srcset: img.srcSet.attribute, width, height };
}

/** Grid-sized images (gallery tiles, project covers). */
export const thumb = (art: Artwork) => rendition(art, [360, 540, 720, 1080], 78);

/** Large images for the lightbox and the about page. */
export const full = (art: Artwork) => rendition(art, [900, 1400, 2000, 2600], 82);

const colours = new Map<string, Promise<string>>();

/** Average colour of the illustration, painted behind the image while it loads. */
export function placeholder(art: Artwork): Promise<string> {
  let c = colours.get(art.abs);
  if (!c) {
    c = sharp(art.abs, { page: 0 })
      .resize(1, 1, { fit: 'fill' })
      .flatten({ background: '#fbf5ec' })
      .raw()
      .toBuffer()
      .then(([r, g, b]) => `rgb(${r} ${g} ${b})`);
    colours.set(art.abs, c);
  }
  return c;
}
