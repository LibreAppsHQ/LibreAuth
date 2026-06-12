import { INDEXABLE_ROUTES, getSiteUrl } from '$lib/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const siteUrl = getSiteUrl(url.origin);
	const lastmod = new Date().toISOString().slice(0, 10);

	const urls = INDEXABLE_ROUTES.map(
		(route) => `  <url>
    <loc>${siteUrl}${route.path === '/' ? '' : route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
	).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
