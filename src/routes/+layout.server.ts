import type { LayoutServerLoad } from './$types';
import { getSiteUrl } from '$lib/seo';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { session, user } = await locals.safeGetSession();
	return {
		session,
		user,
		siteUrl: getSiteUrl(url.origin)
	};
};
