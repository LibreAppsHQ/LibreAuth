<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo.svelte';

	let { title = '' } = $props<{ title?: string }>();

	const loggedIn = $derived(Boolean(page.data.user));

	const navLinks = [
		{ href: '/features', label: 'Features' },
		{ href: '/compare', label: 'Compare' },
		{ href: '/security', label: 'Security' },
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/about', label: 'About' }
	];
</script>

<header class="neo-header">
	<div class="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
		<div class="flex flex-wrap items-center justify-between gap-3 py-4">
			<a href="/" class="shrink-0">
				<Logo class="h-9" />
			</a>

			{#if title}
				<p
					class="neo-heading order-3 w-full text-center text-lg font-bold sm:order-none sm:w-auto sm:text-2xl"
				>
					{title}
				</p>
			{:else}
				<nav
					class="neo-header-nav-scroll order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible"
				>
					{#each navLinks as link}
						<a
							href={link.href}
							class="neo-btn neo-btn-ghost px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
						>
							{link.label}
						</a>
					{/each}
				</nav>
			{/if}

			<div class="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
				{#if loggedIn}
					<a href="/app" class="neo-btn neo-btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm"
						>Open app</a
					>
				{:else}
					<a href="/app/login" class="neo-btn neo-btn-ghost px-3 py-2 text-xs sm:text-sm">
						Sign in
					</a>
					<a href="/app" class="neo-btn neo-btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm"
						>Open app</a
					>
				{/if}
			</div>
		</div>
	</div>
</header>
