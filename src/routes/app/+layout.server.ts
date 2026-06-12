import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const AUTH_PATHS = [
	'/app/login',
	'/app/register',
	'/app/verify-email',
	'/app/forgot-password',
	'/app/reset-password'
];

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { session, user } = await locals.safeGetSession();

	const isAuthPage = AUTH_PATHS.includes(url.pathname);
	const isSignInPage = url.pathname === '/app/login' || url.pathname === '/app/register';

	if (!session && !isAuthPage) {
		throw redirect(303, '/app/login');
	}

	if (session && isSignInPage) {
		throw redirect(303, '/app');
	}

	if (session && user?.email_confirmed_at && url.pathname === '/app/verify-email') {
		throw redirect(303, '/app');
	}

	if (session && user && !user.email_confirmed_at && !isAuthPage) {
		const email = user.email ?? '';
		throw redirect(303, `/app/verify-email?email=${encodeURIComponent(email)}`);
	}

	return { session, user };
};
