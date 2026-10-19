// Reads config.yaml and the images/ folders: the site is entirely driven by
// what is committed there, so adding an illustration never requires touching code.
import path from 'node:path';
import { load } from 'js-yaml';
import type { ImageMetadata } from 'astro';
import rawConfig from '../../config.yaml?raw';

interface RawProject {
  text?: string;
  title?: string;
  client?: string;
  year?: string | number;
  description?: string;
  cover?: string;
  imageDir: string;
}

interface RawConfig {
  imageDir: string;
  projects?: RawProject[];
  logo: string;
  about?: { logo?: string; image?: string; text?: string };
  contact?: { email?: string; instagram?: string; etsy?: string };
}

export interface Artwork {
  /** Path relative to the repo root, e.g. images/work/001_urbaine.jpeg */
  file: string;
  /** Absolute path on disk, used by sharp for colour sampling. */
  abs: string;
  image: ImageMetadata;
}

export interface Project {
  slug: string;
  title: string;
  client?: string;
  year?: string;
  description?: string;
  cover: Artwork;
  images: Artwork[];
}

const modules = import.meta.glob<ImageMetadata>(
  // The logo GIF is processed separately (see brand.ts).
  ['/images/**/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}', '!/images/logo.gif'],
  { eager: true, import: 'default' },
);

// macOS checkouts may store accented file names decomposed (NFD); compare in NFC.
const nfc = (s: string) => s.normalize('NFC');
const clean = (p: string) => nfc(p).replace(/^\.?\/+/, '').replace(/\/+$/, '');

const allArtworks: Artwork[] = Object.entries(modules)
  .map(([key, image]) => {
    const file = clean(key);
    return { file, abs: path.join(process.cwd(), key), image };
  })
  .sort((a, b) => a.file.localeCompare(b.file, 'fr', { numeric: true }));

function imagesIn(dir: string): Artwork[] {
  const prefix = clean(dir) + '/';
  return allArtworks.filter((a) => a.file.startsWith(prefix) && !a.file.slice(prefix.length).includes('/'));
}

function artwork(file: string): Artwork {
  const wanted = clean(file);
  const found = allArtworks.find((a) => a.file === wanted);
  if (!found) throw new Error(`config.yaml: image introuvable « ${file} »`);
  return found;
}

export function slugify(s: string) {
  return nfc(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const config = load(rawConfig) as RawConfig;

/** Main gallery, newest first (files are numbered 001_, 002_…). */
export const works: Artwork[] = imagesIn(config.imageDir).reverse();

export const projects: Project[] = (config.projects ?? [])
  .map((p) => {
    const images = imagesIn(p.imageDir);
    const title = (p.title ?? p.text ?? path.basename(p.imageDir)).trim();
    const cover = p.cover ? artwork(path.join(p.imageDir, p.cover)) : images[0];
    return {
      slug: slugify(title),
      title,
      client: p.client?.trim(),
      year: p.year?.toString(),
      description: p.description?.trim(),
      cover,
      images,
    };
  })
  .filter((p) => p.images.length > 0);

export const logoFile = path.join(process.cwd(), config.logo);

export const about = {
  lettering: config.about?.logo ? artwork(config.about.logo) : undefined,
  image: config.about?.image ? artwork(config.about.image) : undefined,
  paragraphs: (config.about?.text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean),
};

const instagram = config.contact?.instagram?.replace(/^@/, '');
export const contact = {
  email: config.contact?.email,
  instagram: instagram && { handle: `@${instagram}`, url: `https://www.instagram.com/${instagram}/` },
  etsy: config.contact?.etsy,
};
