import type { APIRoute } from 'astro';
import { logoAnimated } from '../lib/brand';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await logoAnimated()), { headers: { 'Content-Type': 'image/webp' } });
