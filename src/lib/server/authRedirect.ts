import { env } from '$env/dynamic/public';

export const AUTH_INTENT_COOKIE = 'la_auth_intent';

/** Origin used in Supabase email redirect_to — must match an allowed redirect URL. */
export function getAuthRedirectOrigin(requestOrigin: string): string {
	const origin = requestOrigin.replace(/\/$/, '');

	if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
		return origin;
	}

	const configured = env.PUBLIC_SITE_URL?.replace(/\/$/, '');
	return configured || origin;
}

export function buildAuthConfirmRedirect(
	requestOrigin: string,
	nextPath: string,
	flow?: 'recovery' | 'signup'
): string {
	const siteUrl = getAuthRedirectOrigin(requestOrigin);
	const params = new URLSearchParams({ next: nextPath });
	if (flow === 'recovery') params.set('type', 'recovery');
	if (flow === 'signup') params.set('type', 'email');
	return `${siteUrl}/app/auth/confirm?${params.toString()}`;
}

export function setAuthIntentCookie(
	cookies: import('@sveltejs/kit').Cookies,
	intent: 'recovery' | 'signup',
	secure: boolean
) {
	cookies.set(AUTH_INTENT_COOKIE, intent, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60,
		secure
	});
}

export function clearAuthIntentCookie(cookies: import('@sveltejs/kit').Cookies) {
	cookies.delete(AUTH_INTENT_COOKIE, { path: '/' });
}

export function resolveAuthNext(
	nextParam: string | null,
	typeParam: string | null,
	pathname: string,
	intent: string | undefined
): { next: string; type: string | null } {
	if (nextParam) {
		return { next: nextParam, type: typeParam };
	}

	if (typeParam === 'recovery' || intent === 'recovery') {
		return { next: '/app/reset-password', type: typeParam ?? 'recovery' };
	}

	if (pathname.startsWith('/app/reset-password')) {
		return { next: '/app/reset-password', type: typeParam ?? 'recovery' };
	}

	if (pathname.startsWith('/app')) {
		return { next: pathname, type: typeParam };
	}

	return { next: '/app', type: typeParam };
}
