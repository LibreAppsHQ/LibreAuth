import { signOutAndRedirect } from '$lib/server/logout';
import type { RequestHandler } from './$types';

/** GET avoids SvelteKit cross-site POST CSRF checks (e.g. when ORIGIN is misconfigured). */
export const GET: RequestHandler = (event) => signOutAndRedirect(event);

export const POST: RequestHandler = (event) => signOutAndRedirect(event);
