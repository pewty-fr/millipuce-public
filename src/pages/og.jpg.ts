import type { APIRoute } from 'astro';
import { socialCard } from '../lib/brand';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await socialCard()), { headers: { 'Content-Type': 'image/jpeg' } });
