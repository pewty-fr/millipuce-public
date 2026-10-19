import type { APIRoute } from 'astro';
import { projects } from '../lib/content';

export const GET: APIRoute = ({ site }) => {
  const paths = ['/', '/projets/', ...projects.map((p) => `/projets/${p.slug}/`), '/a-propos/'];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
