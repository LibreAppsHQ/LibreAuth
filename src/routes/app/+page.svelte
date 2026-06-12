<script lang="ts">
	import { invalidate } from '$app/navigation';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import TotpCard from '$lib/components/TotpCard.svelte';
	import { databaseSetupMessage, isMissingTotpTableError } from '$lib/databaseSetup';
	import { settingsStore } from '$lib/stores/settings';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import type { TotpEntry } from '$lib/totp';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let query = $state('');
	let removeDialogOpen = $state(false);
	let removeTarget = $state<TotpEntry | null>(null);
	const supabase = createSupabaseBrowserClient();
	const setupRequired = $derived(data.dbError && isMissingTotpTableError(data.dbError));

	const filteredEntries = $derived(
		data.entries.filter((entry: TotpEntry) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			const haystack = `${entry.name} ${entry.issuer ?? ''}`.toLowerCase();
			return haystack.includes(q);
		})
	);

	function requestRemove(entry: TotpEntry) {
		removeTarget = entry;
		removeDialogOpen = true;
	}

	async function confirmRemove() {
		if (!removeTarget) return;
		await supabase.from('totp_entries').delete().eq('id', removeTarget.id);
		await invalidate('app:entries');
		removeTarget = null;
	}

	const removeLabel = $derived(removeTarget?.issuer ?? removeTarget?.name ?? 'this account');
</script>

<ConfirmDialog
	bind:open={removeDialogOpen}
	title="Remove account?"
	message="Drop {removeLabel} from your vault. You can add it again later with the setup QR or secret."
	confirmLabel="Remove"
	danger
	onconfirm={confirmRemove}
/>

<SeoHead
	title="Authenticator vault"
	description="Your LibreAuth TOTP code vault."
	robots="noindex, nofollow"
/>

<main class="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-10">
	{#if setupRequired}
		<div class="neo-card mb-6 border-(--app-accent-alt) bg-(--app-accent-alt)/15 p-4 sm:p-5">
			<p class="text-sm font-bold">Database setup required</p>
			<p class="mt-2 text-sm leading-6 text-(--app-muted)">{databaseSetupMessage()}</p>
		</div>
	{:else if data.dbError}
		<div class="neo-card mb-6 border-(--app-accent-alt) bg-(--app-accent-alt)/15 p-4 sm:p-5">
			<p class="text-sm font-bold">Could not load accounts</p>
			<p class="mt-2 text-sm leading-6 text-(--app-muted)">{data.dbError}</p>
		</div>
	{/if}

	<div class="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
		<div class="min-w-0 flex-1">
			<span class="neo-badge">Vault</span>
			<h1 class="neo-heading mt-3 text-3xl font-bold sm:text-4xl">Your codes</h1>
			<p class="mt-1 text-sm font-semibold text-(--app-muted)">
				{#if data.entries.length === 0}
					Add an account to get started.
				{:else}
					{data.entries.length} account{data.entries.length === 1 ? '' : 's'} · rotates every 30s
				{/if}
			</p>
		</div>
		<a href="/app/add" class="neo-btn neo-btn-secondary hidden md:inline-flex">
			<i class="fa-solid fa-plus"></i> Add account
		</a>
	</div>

	{#if data.entries.length === 0}
		<div class="neo-card border-dashed p-12 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-[3px] border-(--app-border) bg-(--app-accent) text-2xl shadow-[4px_4px_0_var(--app-shadow-color)]"
			>
				<i class="fa-solid fa-qrcode"></i>
			</div>
			<h2 class="text-xl font-bold">Empty vault</h2>
			<p class="mx-auto mt-2 max-w-sm text-sm font-medium text-(--app-muted)">
				Scan a setup QR code with your camera, paste an otpauth link, or enter the secret key
				manually.
			</p>
			<a href="/app/add" class="neo-btn neo-btn-primary mt-6">
				<i class="fa-solid fa-camera"></i> Scan QR code
			</a>
		</div>
	{:else}
		<div
			class="sticky top-[calc(var(--safe-top)+4.5rem)] z-20 -mx-1 mb-5 bg-(--app-background)/95 px-1 py-2 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
		>
			<label for="vault-search" class="neo-label">Search accounts</label>
			<input
				id="vault-search"
				type="search"
				bind:value={query}
				placeholder="GitHub, email, issuer…"
				class="neo-input"
				autocomplete="off"
				enterkeyhint="search"
			/>
		</div>

		{#if filteredEntries.length === 0}
			<div class="neo-card border-dashed p-8 text-center">
				<p class="text-sm font-semibold text-(--app-muted)">No accounts match “{query}”.</p>
				<button type="button" onclick={() => (query = '')} class="neo-btn neo-btn-ghost mt-4">
					Clear search
				</button>
			</div>
		{:else}
			<div
				class="grid gap-4 sm:grid-cols-2 {$settingsStore.compactVault ? 'sm:gap-3' : 'sm:gap-5'}"
			>
				{#each filteredEntries as entry (entry.id)}
					<TotpCard
						{entry}
						compact={$settingsStore.compactVault}
						onDelete={() => requestRemove(entry)}
					/>
				{/each}
			</div>
		{/if}
	{/if}

	<p class="mt-8 hidden text-center sm:mt-12 md:block">
		<a href="/app/settings" class="neo-link text-sm">Settings</a>
		<span class="text-(--app-muted)">·</span>
		<a href="/" class="neo-link text-sm">Back to site</a>
	</p>
</main>
