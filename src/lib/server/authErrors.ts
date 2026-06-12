export function isAuthEmailRateLimitError(message: string): boolean {
	const lower = message.toLowerCase();
	return (
		lower.includes('rate limit') ||
		lower.includes('once every') ||
		lower.includes('over_email_send_rate_limit')
	);
}

export function formatAuthEmailError(message: string): string {
	if (isAuthEmailRateLimitError(message)) {
		return 'Email rate limit reached on Supabase’s built-in mail service (~2 emails/hour). Wait up to an hour, check your inbox for an earlier message, or add custom SMTP under Supabase → Authentication → SMTP Settings (still uses Supabase Auth — just your mail server).';
	}

	return message;
}
