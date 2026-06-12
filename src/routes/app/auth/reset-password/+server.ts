import { json } from '@sveltejs/kit';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import { requireTurnstile } from '$lib/server/turnstile';
import type { RequestHandler } from './$types';

const RECOVERY_COOKIE = 'password_recovery';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	let password = '';
	let turnstileToken: string | undefined;

	try {
		const body = (await request.json()) as {
			password?: string;
			turnstileToken?: string;
		};
		password = body.password ?? '';
		turnstileToken = body.turnstileToken;
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!password) {
		return json({ error: 'Password is required.' }, { status: 400 });
	}

	if (password.length < 8) {
		return json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
	}

	if (!cookies.get(RECOVERY_COOKIE)) {
		return json(
			{ error: 'Enter the code from your email on the forgot password page first.' },
			{ status: 403 }
		);
	}

	const turnstile = await requireTurnstile(turnstileToken, getClientAddress());
	if (!turnstile.ok) {
		return json({ error: turnstile.error }, { status: 400 });
	}

	const supabase = createSupabaseRouteClient(cookies);
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session) {
		return json({ error: 'Code expired or invalid. Request a new one.' }, { status: 401 });
	}

	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	cookies.delete(RECOVERY_COOKIE, { path: '/' });

	return json({ ok: true });
};
