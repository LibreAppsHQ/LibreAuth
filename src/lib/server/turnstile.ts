import { env as publicEnv } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';

type TurnstileVerifyResponse = {
	success: boolean;
	'error-codes'?: string[];
};

export type TurnstileCheckResult = { ok: true; skipped?: boolean } | { ok: false; error: string };

export function isTurnstileConfigured(): boolean {
	return Boolean(publicEnv.PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
}

export function getTurnstileSiteKey(): string | undefined {
	return publicEnv.PUBLIC_TURNSTILE_SITE_KEY || undefined;
}

export async function requireTurnstile(
	token: string | undefined,
	remoteip?: string
): Promise<TurnstileCheckResult> {
	if (!publicEnv.PUBLIC_TURNSTILE_SITE_KEY && !env.TURNSTILE_SECRET_KEY) {
		return { ok: true, skipped: true };
	}

	if (!env.TURNSTILE_SECRET_KEY) {
		return { ok: false, error: 'Turnstile is not configured on the server.' };
	}

	if (!token) {
		return { ok: false, error: 'Complete the security check and try again.' };
	}

	const body = new URLSearchParams({
		secret: env.TURNSTILE_SECRET_KEY,
		response: token
	});

	if (remoteip) {
		body.set('remoteip', remoteip);
	}

	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	if (!response.ok) {
		return { ok: false, error: 'Security check failed. Try again.' };
	}

	const result = (await response.json()) as TurnstileVerifyResponse;

	if (!result.success) {
		return { ok: false, error: 'Security check failed. Refresh and try again.' };
	}

	return { ok: true };
}
