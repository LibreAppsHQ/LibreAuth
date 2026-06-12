import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import { isRecoveryFlow } from '$lib/server/authCallback';
import {
	AUTH_INTENT_COOKIE,
	clearAuthIntentCookie,
	resolveAuthNext
} from '$lib/server/authRedirect';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import type { RequestHandler } from './$types';

const RECOVERY_COOKIE = 'password_recovery';

function authErrorRedirect(type: EmailOtpType | null, message: string): never {
	const encoded = encodeURIComponent(message);
	if (type === 'recovery') {
		throw redirect(303, `/app/forgot-password?error=${encoded}`);
	}
	if (type === 'email' || type === 'signup') {
		throw redirect(303, `/app/verify-email?error=${encoded}`);
	}
	throw redirect(303, `/app/login?error=${encoded}`);
}

function setRecoveryCookie(cookies: import('@sveltejs/kit').Cookies, secure: boolean) {
	cookies.set(RECOVERY_COOKIE, '1', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60,
		secure
	});
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const token_hash = url.searchParams.get('token_hash');
	const typeParam = url.searchParams.get('type') as EmailOtpType | null;
	const code = url.searchParams.get('code');
	const intent = cookies.get(AUTH_INTENT_COOKIE);
	const secure = url.protocol === 'https:';

	const { next, type: resolvedType } = resolveAuthNext(
		url.searchParams.get('next'),
		typeParam,
		url.pathname,
		intent
	);
	const type = (resolvedType ?? typeParam) as EmailOtpType | null;
	const recovery = isRecoveryFlow(type, next, intent);

	const supabase = createSupabaseRouteClient(cookies);

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });

		if (error) {
			authErrorRedirect(type, error.message);
		}

		clearAuthIntentCookie(cookies);
		if (recovery) setRecoveryCookie(cookies, secure);

		throw redirect(303, recovery ? '/app/reset-password' : next);
	}

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			authErrorRedirect(type, error.message);
		}

		clearAuthIntentCookie(cookies);
		if (recovery) setRecoveryCookie(cookies, secure);

		throw redirect(303, recovery ? '/app/reset-password' : next);
	}

	throw redirect(
		303,
		`/app/login?error=${encodeURIComponent('Invalid or expired link. Request a new confirmation or reset email.')}`
	);
};
