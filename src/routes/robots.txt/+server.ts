import { getSiteUrl } from '$lib/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const siteUrl = getSiteUrl(url.origin);

	const body = `User-agent: *
Allow: /

Disallow: /app/
Disallow: /app

Sitemap: ${siteUrl}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
