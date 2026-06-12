import { json } from '@sveltejs/kit';
import { formatAuthEmailError } from '$lib/server/authErrors';
import { checkAuthEmailCooldown, markAuthEmailSent } from '$lib/server/authEmailCooldown';
import { getAuthRedirectOrigin } from '$lib/server/authRedirect';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import { requireTurnstile } from '$lib/server/turnstile';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
	let email = '';
	let turnstileToken: string | undefined;

	try {
		const body = (await request.json()) as {
			email?: string;
			turnstileToken?: string;
		};
		email = body.email?.trim() ?? '';
		turnstileToken = body.turnstileToken;
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!email) {
		return json({ error: 'Email is required.' }, { status: 400 });
	}

	const turnstile = await requireTurnstile(turnstileToken, getClientAddress());
	if (!turnstile.ok) {
		return json({ error: turnstile.error }, { status: 400 });
	}

	const cooldown = checkAuthEmailCooldown(cookies);
	if (cooldown) {
		return json({ error: cooldown }, { status: 429 });
	}

	const origin = getAuthRedirectOrigin(url.origin);
	const redirectTo = `${origin}/app/forgot-password`;

	const supabase = createSupabaseRouteClient(cookies);
	const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

	if (error) {
		return json({ error: formatAuthEmailError(error.message) }, { status: 400 });
	}

	markAuthEmailSent(cookies, url.protocol === 'https:');
	return json({ ok: true });
};
