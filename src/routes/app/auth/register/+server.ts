import { json } from '@sveltejs/kit';
import { formatAuthEmailError } from '$lib/server/authErrors';
import { checkAuthEmailCooldown, markAuthEmailSent } from '$lib/server/authEmailCooldown';
import { buildAuthConfirmRedirect, setAuthIntentCookie } from '$lib/server/authRedirect';
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

	if (password.length < 8) {
		return json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
	}

	const turnstile = await requireTurnstile(turnstileToken, getClientAddress());
	if (!turnstile.ok) {
		return json({ error: turnstile.error }, { status: 400 });
	}

	const cooldown = checkAuthEmailCooldown(cookies);
	if (cooldown) {
		return json({ error: cooldown }, { status: 429 });
	}

	const secure = url.protocol === 'https:';
	const emailRedirectTo = buildAuthConfirmRedirect(url.origin, '/app', 'signup');

	const supabase = createSupabaseRouteClient(cookies, url.protocol === 'https:');
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: { emailRedirectTo }
	});

	if (error) {
		const formatted = formatAuthEmailError(error.message);
		const lower = error.message.toLowerCase();

		if (lower.includes('already registered') || lower.includes('already been registered')) {
			return json(
				{
					error:
						'An account with this email already exists. Sign in, or use verify email if you never confirmed.'
				},
				{ status: 400 }
			);
		}

		return json({ error: formatted }, { status: 400 });
	}

	const verified = Boolean(data.user?.email_confirmed_at);
	const needsVerification = !verified;

	if (needsVerification) {
		setAuthIntentCookie(cookies, 'signup', secure);
		markAuthEmailSent(cookies, secure);
	}

	return json({
		ok: true,
		needsVerification,
		email
	});
};
