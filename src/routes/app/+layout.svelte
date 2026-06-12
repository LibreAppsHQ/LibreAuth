<script lang="ts">
	import { page } from '$app/state';
	import AppMobileNav from '$lib/components/AppMobileNav.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import type { LayoutData } from './$types';

	let { data, children } = $props<{ data: LayoutData; children: import('svelte').Snippet }>();

	const AUTH_PAGE_TITLES: Record<string, string> = {
		'/app/login': 'Sign in',
		'/app/register': 'Register',
		'/app/verify-email': 'Verify email',
		'/app/forgot-password': 'Forgot password',
		'/app/reset-password': 'Reset password'
	};

	let isAuthPage = $derived(page.url.pathname in AUTH_PAGE_TITLES);
	let authPageTitle = $derived(AUTH_PAGE_TITLES[page.url.pathname] ?? '');
	let isSettingsPage = $derived(page.url.pathname.startsWith('/app/settings'));
</script>

<div class="neo-shell">
	{#if isAuthPage}
		<MarketingHeader title={authPageTitle} />
	{:else}
		<header class="neo-header">
			<div class="mx-auto flex max-w-[920px] items-center justify-between px-4 py-3 sm:px-6">
				<a href="/app" class="min-h-11 min-w-11 content-center"><Logo class="h-8" /></a>

				{#if data.user}
					<nav class="hidden items-center gap-2 md:flex">
						<a href="/app/add" class="neo-btn neo-btn-primary px-3 py-2 text-xs sm:text-sm">
							<i class="fa-solid fa-plus"></i>
							<span class="hidden sm:inline">Add</span>
						</a>
						<a
							href="/app/settings"
							class="neo-btn neo-btn-ghost neo-btn-icon {isSettingsPage ? 'neo-btn-primary' : ''}"
							aria-current={isSettingsPage ? 'page' : undefined}
							aria-label="Settings"
						>
							<i class="fa-solid fa-gear"></i>
						</a>
						<form method="POST" action="/app/auth/logout">
							<button type="submit" class="neo-btn neo-btn-ghost px-3 py-2 text-xs sm:text-sm"
								>Out</button
							>
						</form>
					</nav>
				{/if}
			</div>
		</header>
	{/if}

	<div class:neo-app-main={data.user && !isAuthPage}>
		{@render children()}
	</div>

	{#if data.user && !isAuthPage}
		<AppMobileNav />
	{/if}

	{#if isAuthPage}
		<SiteFooter />
	{/if}
</div>
