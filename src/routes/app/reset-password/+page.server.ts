import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const RECOVERY_COOKIE = 'password_recovery';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(303, '/app/forgot-password');
	}

	if (!cookies.get(RECOVERY_COOKIE)) {
		throw redirect(303, '/app/forgot-password?error=Enter+the+code+from+your+email+first.');
	}

	return {};
};
