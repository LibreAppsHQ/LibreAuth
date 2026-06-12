import { json } from '@sveltejs/kit';
import { createSupabaseRouteClient, getAuthenticatedUser } from '$lib/server/supabaseCookies';
import type { RequestHandler } from './$types';

const RECOVERY_COOKIE = 'password_recovery';

export const POST: RequestHandler = async ({ cookies, url }) => {
	const supabase = createSupabaseRouteClient(cookies, url.protocol === 'https:');
	const user = await getAuthenticatedUser(supabase);

	if (!user) {
		return json({ error: 'No active recovery session.' }, { status: 401 });
	}

	cookies.set(RECOVERY_COOKIE, '1', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60,
		secure: url.protocol === 'https:'
	});

	return json({ ok: true });
};
