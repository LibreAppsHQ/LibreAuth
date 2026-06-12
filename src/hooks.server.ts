import { redirect } from '@sveltejs/kit';
import { buildAuthConfirmForwardUrl } from '$lib/server/authCallback';
import { createSupabaseServerClient } from '$lib/server/supabaseCookies';
import type { Handle } from '@sveltejs/kit';
import type { Session, User } from '@supabase/supabase-js';

export const handle: Handle = async ({ event, resolve }) => {
	const forwardUrl = buildAuthConfirmForwardUrl(event.url, event.cookies);
	if (forwardUrl) {
		throw redirect(303, forwardUrl);
	}

	const secure = event.url.protocol === 'https:';
	const supabase = createSupabaseServerClient(event.cookies, secure);

	let session: Session | null = null;
	let user: User | null = null;

	const {
		data: { user: authedUser },
		error
	} = await supabase.auth.getUser();

	if (!error && authedUser) {
		user = authedUser;
		const {
			data: { session: authedSession }
		} = await supabase.auth.getSession();
		session = authedSession;
	}

	event.locals.safeGetSession = async () => ({ session, user });

	return resolve(event);
};
