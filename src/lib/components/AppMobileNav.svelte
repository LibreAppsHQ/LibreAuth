<script lang="ts">
	import { page } from '$app/state';
	import { hideMobileNav } from '$lib/stores/appUi';

	const path = $derived(page.url.pathname);

	const items = [
		{ href: '/app', label: 'Vault', icon: 'fa-shield-halved', match: (p: string) => p === '/app' },
		{
			href: '/app/add',
			label: 'Add',
			icon: 'fa-qrcode',
			match: (p: string) => p.startsWith('/app/add')
		},
		{
			href: '/app/settings',
			label: 'Settings',
			icon: 'fa-gear',
			match: (p: string) => p.startsWith('/app/settings')
		}
	] as const;
</script>

{#if !$hideMobileNav}
	<nav class="neo-mobile-nav grid md:hidden" aria-label="App navigation">
		{#each items as item}
			<a
				href={item.href}
				class="neo-mobile-nav-item"
				class:neo-mobile-nav-item-active={item.match(path)}
				aria-current={item.match(path) ? 'page' : undefined}
			>
				<i class="fa-solid {item.icon} text-base"></i>
				<span>{item.label}</span>
			</a>
		{/each}

		<a href="/app/auth/logout" class="neo-mobile-nav-item" aria-label="Sign out">
			<i class="fa-solid fa-right-from-bracket text-base"></i>
			<span>Out</span>
		</a>
	</nav>
{/if}
