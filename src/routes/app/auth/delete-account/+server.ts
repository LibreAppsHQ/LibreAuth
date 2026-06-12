import { json } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/supabaseAdmin';
import { createSupabaseRouteClient } from '$lib/server/supabaseCookies';
import { requireTurnstile } from '$lib/server/turnstile';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies, request, getClientAddress }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		return json({ error: 'Not signed in.' }, { status: 401 });
	}

	let confirm = '';
	let turnstileToken: string | undefined;

	try {
		const body = (await request.json()) as { confirm?: string; turnstileToken?: string };
		confirm = body.confirm ?? '';
		turnstileToken = body.turnstileToken;
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (confirm !== 'DELETE') {
		return json({ error: 'Type DELETE to confirm account removal.' }, { status: 400 });
	}

	const turnstile = await requireTurnstile(turnstileToken, getClientAddress());
	if (!turnstile.ok) {
		return json({ error: turnstile.error }, { status: 400 });
	}

	let admin;
	try {
		admin = createSupabaseAdminClient();
	} catch {
		return json(
			{
				error:
					'Account deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your server environment.'
			},
			{ status: 503 }
		);
	}

	const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

	if (deleteError) {
		return json({ error: deleteError.message }, { status: 500 });
	}

	const supabase = createSupabaseRouteClient(cookies);
	await supabase.auth.signOut();

	return json({ ok: true });
};
