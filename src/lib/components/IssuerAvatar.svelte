<script lang="ts">
	import { issuerFaviconUrl, issuerInitial } from '$lib/issuerLogo';
	import { issuerColor } from '$lib/totp';

	let {
		issuer,
		name,
		showLogo = false,
		class: className = 'h-12 w-12'
	} = $props<{
		issuer: string | null;
		name: string;
		showLogo?: boolean;
		class?: string;
	}>();

	let logoFailed = $state(false);

	const color = $derived(issuerColor(issuer));
	const initial = $derived(issuerInitial(issuer, name));
	const logoUrl = $derived(showLogo && !logoFailed ? issuerFaviconUrl(issuer, name) : null);

	$effect(() => {
		void issuer;
		void name;
		void showLogo;
		logoFailed = false;
	});
</script>

<div
	class="flex shrink-0 items-center justify-center overflow-hidden border-[3px] border-(--app-border) shadow-[3px_3px_0_var(--app-shadow-color)] {className}"
	style="background: {logoUrl ? 'var(--app-card)' : color}"
>
	{#if logoUrl}
		<img
			src={logoUrl}
			alt=""
			class="h-[70%] w-[70%] object-contain"
			loading="lazy"
			decoding="async"
			referrerpolicy="no-referrer"
			onerror={() => (logoFailed = true)}
		/>
	{:else}
		<span class="text-base font-bold text-(--app-on-accent)">{initial}</span>
	{/if}
</div>
