<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import AuthCallbackClient from '$lib/components/AuthCallbackClient.svelte';
	import PostHogProvider from '$lib/components/PostHogProvider.svelte';
	import { initCookieConsent } from '$lib/stores/cookieConsent';
	import { settingsStore } from '$lib/stores/settings';
	import { themeStore } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if (!browser) return;
		initCookieConsent();
		settingsStore.load();
		themeStore.load();

		const defer = (fn: () => void) => {
			if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 4000 });
			else setTimeout(fn, 200);
		};

		defer(() => {
			import('@fortawesome/fontawesome-free/css/all.css');
		});
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&family=Space+Grotesk:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="apple-touch-icon" href="/icon-192.png" />
	<link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
</svelte:head>

{@render children()}

<AuthCallbackClient />
<PostHogProvider />
<CookieBanner />
