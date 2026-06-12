<script lang="ts">
	import { page } from '$app/state';
	import {
		DEFAULT_OG_IMAGE,
		DEFAULT_OG_IMAGE_ALT,
		TWITTER_HANDLE,
		absoluteUrl,
		buildJsonLd,
		formatTitle,
		type BreadcrumbItem,
		type FaqItem
	} from '$lib/seo';

	let {
		title,
		description,
		path = page.url.pathname,
		image = DEFAULT_OG_IMAGE,
		imageAlt = DEFAULT_OG_IMAGE_ALT,
		robots = 'index, follow',
		type = 'website',
		breadcrumbs = [],
		faqs = [],
		includeSoftware = false,
		includeOrganization = false,
		includeWebSite = false,
		jsonLd = []
	} = $props<{
		title: string;
		description: string;
		path?: string;
		image?: string;
		imageAlt?: string;
		robots?: string;
		type?: 'website' | 'article';
		breadcrumbs?: BreadcrumbItem[];
		faqs?: FaqItem[];
		includeSoftware?: boolean;
		includeOrganization?: boolean;
		includeWebSite?: boolean;
		jsonLd?: Record<string, unknown>[];
	}>();

	const siteUrl = $derived((page.data.siteUrl as string | undefined) ?? page.url.origin);
	const pageTitle = $derived(formatTitle(title));
	const canonical = $derived(absoluteUrl(siteUrl, path));
	const ogImage = $derived(image.startsWith('http') ? image : absoluteUrl(siteUrl, image));

	const schemas = $derived([
		...buildJsonLd(siteUrl, {
			path,
			title,
			description,
			breadcrumbs,
			faqs,
			includeSoftware,
			includeOrganization,
			includeWebSite
		}),
		...jsonLd
	]);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonical} />

	<meta property="og:site_name" content="LibreAuth" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:type" content={type} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content={imageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	{#if TWITTER_HANDLE}
		<meta name="twitter:site" content={TWITTER_HANDLE} />
	{/if}
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={imageAlt} />

	{#each schemas as schema (JSON.stringify(schema))}
		<script type="application/ld+json">
			{JSON.stringify(schema).replace(/</g, '\\u003c')}
		</script>
	{/each}
</svelte:head>
