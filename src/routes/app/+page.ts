import { createSupabaseBrowserClient } from '$lib/supabase';
import type { PageLoad } from './$types';
import type { TotpEntry } from '$lib/totp';

export const load: PageLoad = async ({ parent, depends }) => {
	depends('app:entries');
	const { session } = await parent();
	if (!session) return { entries: [] as TotpEntry[], dbError: null };

	const supabase = createSupabaseBrowserClient();
	const { data, error } = await supabase
		.from('totp_entries')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: true });

	if (error) {
		console.error(error);
		return { entries: [] as TotpEntry[], dbError: error.message };
	}

	return { entries: (data ?? []) as TotpEntry[], dbError: null };
};
