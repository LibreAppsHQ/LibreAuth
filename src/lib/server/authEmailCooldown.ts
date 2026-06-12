import type { Cookies } from '@sveltejs/kit';

export const AUTH_EMAIL_COOLDOWN_MS = 60_000;
const COOLDOWN_COOKIE = 'la_auth_email_sent';

export function checkAuthEmailCooldown(cookies: Cookies): string | null {
	const lastSent = cookies.get(COOLDOWN_COOKIE);
	if (!lastSent) return null;

	const elapsed = Date.now() - Number(lastSent);
	if (!Number.isFinite(elapsed) || elapsed >= AUTH_EMAIL_COOLDOWN_MS) {
		return null;
	}

	const seconds = Math.ceil((AUTH_EMAIL_COOLDOWN_MS - elapsed) / 1000);
	return `Please wait ${seconds}s before requesting another email.`;
}

export function markAuthEmailSent(cookies: Cookies, secure: boolean) {
	cookies.set(COOLDOWN_COOKIE, String(Date.now()), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: AUTH_EMAIL_COOLDOWN_MS / 1000,
		secure
	});
}
