import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Cookies } from '@sveltejs/kit';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/** Matches @supabase/ssr default — keeps auth cookies across browser restarts. */
export const AUTH_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

type SupabaseCookie = {
	name: string;
	value: string;
	options: Record<string, unknown>;
};

export function applySupabaseCookies(cookies: Cookies, cookiesToSet: SupabaseCookie[], secure: boolean) {
	cookiesToSet.forEach(({ name, value, options }) => {
		const maxAge =
			typeof options.maxAge === 'number' ? options.maxAge : AUTH_COOKIE_MAX_AGE;

		if (value) {
			cookies.set(name, value, {
				...options,
				path: '/',
				sameSite: 'lax',
				secure,
				maxAge
			});
			return;
		}

		cookies.delete(name, { path: '/' });
	});
}

export function createSupabaseServerClient(cookies: Cookies, secure = true) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => applySupabaseCookies(cookies, cookiesToSet, secure)
		},
		cookieOptions: {
			secure,
			maxAge: AUTH_COOKIE_MAX_AGE
		}
	});
}

export function createSupabaseRouteClient(cookies: Cookies, secure = true) {
	return createSupabaseServerClient(cookies, secure);
}

/** Validates the current user with Supabase Auth; do not trust getSession().user on the server. */
export async function getAuthenticatedUser(supabase: SupabaseClient): Promise<User | null> {
	const {
		data: { user },
		error
	} = await supabase.auth.getUser();

	if (error || !user) {
		return null;
	}

	return user;
}
