import { json } from '@sveltejs/kit';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import { requireTurnstile } from '$lib/server/turnstile';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
	let email = '';
	let password = '';
	let turnstileToken: string | undefined;

	try {
		const body = (await request.json()) as {
			email?: string;
			password?: string;
			turnstileToken?: string;
		};
		email = body.email?.trim() ?? '';
		password = body.password ?? '';
		turnstileToken = body.turnstileToken;
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!email || !password) {
		return json({ error: 'Email and password are required.' }, { status: 400 });
	}

	const turnstile = await requireTurnstile(turnstileToken, getClientAddress());
	if (!turnstile.ok) {
		return json({ error: turnstile.error }, { status: 400 });
	}

	const supabase = createSupabaseRouteClient(cookies, url.protocol === 'https:');
	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	return json({ ok: true });
};
