import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidBase32, normalizeSecret, type ParsedOtpAuth } from '$lib/totp';

export async function insertTotpEntry(
	supabase: SupabaseClient,
	userId: string,
	entry: ParsedOtpAuth
): Promise<string | null> {
	const secret = normalizeSecret(entry.secret);
	if (!isValidBase32(secret)) {
		return 'Secret must be valid Base32.';
	}

	const { error } = await supabase.from('totp_entries').insert({
		user_id: userId,
		name: entry.name.trim() || 'Account',
		issuer: entry.issuer?.trim() || null,
		secret,
		digits: entry.digits,
		period: entry.period,
		algorithm: entry.algorithm
	});

	return error?.message ?? null;
}
