import type { APIRoute } from 'astro';
import { logoStatic } from '../lib/brand';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await logoStatic()), { headers: { 'Content-Type': 'image/webp' } });
