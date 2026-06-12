import { redirect } from '@sveltejs/kit';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import type { RequestEvent } from '@sveltejs/kit';

export async function signOutAndRedirect(
	event: Pick<RequestEvent, 'locals' | 'cookies' | 'url'>
): Promise<never> {
	const { user } = await event.locals.safeGetSession();

	if (user) {
		const secure = event.url.protocol === 'https:';
		const client = createSupabaseRouteClient(event.cookies, secure);
		await client.auth.signOut();
	}

	throw redirect(303, '/app/login');
}
