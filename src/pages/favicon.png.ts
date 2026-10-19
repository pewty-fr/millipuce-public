import type { APIRoute } from 'astro';
import { icon } from '../lib/brand';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await icon(96)), { headers: { 'Content-Type': 'image/png' } });
