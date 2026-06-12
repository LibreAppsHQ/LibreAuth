import type { EmailOtpType } from '@supabase/supabase-js';
import { AUTH_INTENT_COOKIE, resolveAuthNext } from '$lib/server/authRedirect';

const CONFIRM_PATH = '/app/auth/confirm';

/** Forward Supabase email links that land on / or /app with auth query params. */
export function buildAuthConfirmForwardUrl(
	url: URL,
	cookies?: { get: (name: string) => string | undefined }
): string | null {
	if (url.pathname === CONFIRM_PATH) return null;

	const code = url.searchParams.get('code');
	const token_hash = url.searchParams.get('token_hash');
	if (!code && !token_hash) return null;

	const type = url.searchParams.get('type');
	const intent = cookies?.get(AUTH_INTENT_COOKIE);
	const { next, type: resolvedType } = resolveAuthNext(
		url.searchParams.get('next'),
		type,
		url.pathname,
		intent
	);

	const params = new URLSearchParams();
	if (code) params.set('code', code);
	if (token_hash) params.set('token_hash', token_hash);
	if (resolvedType) params.set('type', resolvedType);
	params.set('next', next);

	return `${CONFIRM_PATH}?${params.toString()}`;
}

export function isRecoveryFlow(
	type: string | null,
	next: string,
	intent: string | undefined
): boolean {
	return type === 'recovery' || next === '/app/reset-password' || intent === 'recovery';
}

export type { EmailOtpType };
