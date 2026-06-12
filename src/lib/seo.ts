import { env } from '$env/dynamic/public';

export const SITE_NAME = 'LibreAuth';
export const SITE_TAGLINE = 'Open source TOTP authenticator';
export const DEFAULT_OG_IMAGE = '/og.svg';
export const DEFAULT_OG_IMAGE_ALT =
	'LibreAuth — neo-brutalist open source TOTP authenticator with Supabase sync';
export const TWITTER_HANDLE = '';

export const INDEXABLE_ROUTES = [
	{ path: '/', priority: 1, changefreq: 'weekly' as const },
	{ path: '/features', priority: 0.9, changefreq: 'monthly' as const },
	{ path: '/compare', priority: 0.9, changefreq: 'monthly' as const },
	{ path: '/pricing', priority: 0.85, changefreq: 'monthly' as const },
	{ path: '/about', priority: 0.8, changefreq: 'monthly' as const },
	{ path: '/security', priority: 0.8, changefreq: 'monthly' as const },
	{ path: '/privacy', priority: 0.5, changefreq: 'yearly' as const }
];

export function getSiteUrl(fallbackOrigin = ''): string {
	const configured = env.PUBLIC_SITE_URL?.replace(/\/$/, '');
	if (configured) return configured;
	return fallbackOrigin.replace(/\/$/, '');
}

export function absoluteUrl(siteUrl: string, path: string): string {
	if (!siteUrl) return path;
	return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function formatTitle(title: string): string {
	return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export type FaqItem = { q: string; a: string };
export type BreadcrumbItem = { name: string; path: string };

export function organizationSchema(siteUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: siteUrl,
		logo: absoluteUrl(siteUrl, '/favicon.svg'),
		description:
			'Open-source web authenticator for TOTP two-factor codes. Self-hostable, Supabase sync, neo-brutalist UI.'
	};
}

export function webSiteSchema(siteUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: siteUrl,
		description: DEFAULT_OG_IMAGE_ALT,
		publisher: {
			'@type': 'Organization',
			name: SITE_NAME,
			url: siteUrl
		}
	};
}

export function softwareApplicationSchema(siteUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: SITE_NAME,
		applicationCategory: 'SecurityApplication',
		operatingSystem: 'Web',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Browser-based TOTP authenticator with QR import, Supabase sync, PWA install, and self-hosting.',
		url: absoluteUrl(siteUrl, '/app'),
		image: absoluteUrl(siteUrl, DEFAULT_OG_IMAGE),
		softwareHelp: absoluteUrl(siteUrl, '/features'),
		featureList: [
			'TOTP code generation',
			'QR code and manual secret import',
			'Supabase cloud sync',
			'Self-hostable AGPL license',
			'Progressive Web App'
		]
	};
}

export function webPageSchema(siteUrl: string, path: string, title: string, description: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: formatTitle(title),
		description,
		url: absoluteUrl(siteUrl, path),
		isPartOf: {
			'@type': 'WebSite',
			name: SITE_NAME,
			url: siteUrl
		}
	};
}

export function breadcrumbSchema(siteUrl: string, items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(siteUrl, item.path)
		}))
	};
}

export function faqSchema(faqs: FaqItem[]) {
	if (!faqs.length) return null;

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.a
			}
		}))
	};
}

export function buildJsonLd(
	siteUrl: string,
	options: {
		path: string;
		title: string;
		description: string;
		breadcrumbs?: BreadcrumbItem[];
		faqs?: FaqItem[];
		extra?: Record<string, unknown>[];
		includeSoftware?: boolean;
		includeOrganization?: boolean;
		includeWebSite?: boolean;
	}
) {
	const schemas: Record<string, unknown>[] = [];

	if (options.includeOrganization) {
		schemas.push(organizationSchema(siteUrl));
	}
	if (options.includeWebSite) {
		schemas.push(webSiteSchema(siteUrl));
	}
	if (options.includeSoftware) {
		schemas.push(softwareApplicationSchema(siteUrl));
	}

	schemas.push(webPageSchema(siteUrl, options.path, options.title, options.description));

	if (options.breadcrumbs?.length) {
		schemas.push(breadcrumbSchema(siteUrl, options.breadcrumbs));
	}

	const faq = faqSchema(options.faqs ?? []);
	if (faq) schemas.push(faq);

	if (options.extra?.length) {
		schemas.push(...options.extra);
	}

	return schemas;
}
