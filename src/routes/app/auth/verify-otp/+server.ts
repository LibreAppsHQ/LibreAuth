import { json } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import type { RequestHandler } from './$types';

const RECOVERY_COOKIE = 'password_recovery';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	let email = '';
	let token = '';
	let type: EmailOtpType = 'email';

	try {
		const body = (await request.json()) as {
			email?: string;
			token?: string;
			type?: EmailOtpType;
		};
		email = body.email?.trim() ?? '';
		token = body.token?.trim() ?? '';
		type = body.type ?? 'email';
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!email || !token) {
		return json({ error: 'Email and code are required.' }, { status: 400 });
	}

	const supabase = createSupabaseRouteClient(cookies);
	const { error } = await supabase.auth.verifyOtp({ email, token, type });

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	if (type === 'recovery') {
		cookies.set(RECOVERY_COOKIE, '1', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60,
			secure: url.protocol === 'https:'
		});
	}

	return json({ ok: true, recovery: type === 'recovery' });
};
