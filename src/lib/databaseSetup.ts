export function isMissingTotpTableError(message: string): boolean {
	return /could not find the table|totp_entries|schema cache|PGRST205|42P01/i.test(message);
}

export function databaseSetupMessage(): string {
	return 'Database not set up. Run: pnpm db:setup (or paste supabase/migrations/001_initial.sql in the Supabase SQL editor).';
}
