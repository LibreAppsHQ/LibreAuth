<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import QrScanner from '$lib/components/QrScanner.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { hideMobileNav } from '$lib/stores/appUi';
	import { getDefaultPeriod, settingsStore } from '$lib/stores/settings';
	import { insertTotpEntry } from '$lib/totpEntries';
	import { databaseSetupMessage, isMissingTotpTableError } from '$lib/databaseSetup';
	import { isValidBase32, normalizeSecret, parseOtpAuthUri, type ParsedOtpAuth } from '$lib/totp';

	type Tab = 'scan' | 'paste' | 'manual';

	let tab = $state<Tab>('scan');
	let otpUri = $state('');
	let name = $state('');
	let issuer = $state('');
	let secret = $state('');
	let digits = $state(6);
	let period = $state(30);
	let algorithm = $state('SHA1');
	let pending = $state<ParsedOtpAuth | null>(null);
	let error = $state('');
	let loading = $state(false);
	let lastScan = $state('');

	const supabase = createSupabaseBrowserClient();

	function resetForm() {
		name = '';
		issuer = '';
		secret = '';
		digits = 6;
		period = getDefaultPeriod();
		algorithm = 'SHA1';
		pending = null;
		error = '';
		lastScan = '';
	}

	function applyParsed(parsed: ParsedOtpAuth) {
		name = parsed.name;
		issuer = parsed.issuer ?? '';
		secret = parsed.secret;
		digits = parsed.digits;
		period = parsed.period;
		algorithm = parsed.algorithm;
		pending = parsed;
		error = '';
	}

	function handleScan(text: string) {
		if (text === lastScan) return;
		lastScan = text;

		const parsed = parseOtpAuthUri(text);
		if (!parsed) {
			error = 'That QR code is not a valid authenticator setup code.';
			return;
		}

		applyParsed(parsed);
	}

	function applyUri() {
		const parsed = parseOtpAuthUri(otpUri);
		if (!parsed) {
			error = 'Invalid otpauth:// URI. Paste the full string from your service.';
			return;
		}

		applyParsed(parsed);
		tab = 'manual';
	}

	function buildManualEntry(): ParsedOtpAuth | null {
		const cleanSecret = normalizeSecret(secret);
		if (!isValidBase32(cleanSecret)) {
			error = 'Secret must be valid Base32.';
			return null;
		}

		return {
			secret: cleanSecret,
			name: name.trim() || 'Account',
			issuer: issuer.trim() || null,
			digits,
			period,
			algorithm: algorithm.toUpperCase()
		};
	}

	async function saveEntry(entry: ParsedOtpAuth) {
		loading = true;
		error = '';

		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			error = 'Not signed in.';
			loading = false;
			return;
		}

		const insertError = await insertTotpEntry(supabase, user.id, entry);
		loading = false;

		if (insertError) {
			error = isMissingTotpTableError(insertError) ? databaseSetupMessage() : insertError;
			return;
		}

		await invalidate('app:entries');
		goto('/app');
	}

	async function submitManual(e: Event) {
		e.preventDefault();
		const entry = buildManualEntry();
		if (!entry) return;
		await saveEntry(entry);
	}

	async function savePending() {
		if (!pending) return;
		await saveEntry(pending);
	}

	function switchTab(next: Tab) {
		tab = next;
		if (next !== 'scan') {
			pending = null;
			lastScan = '';
		}
		error = '';
	}

	const previewTitle = $derived(pending?.issuer || pending?.name || 'New account');
	const previewSubtitle = $derived(pending?.issuer ? pending.name : null);

	$effect(() => {
		hideMobileNav.set(tab === 'scan' && !pending);
		return () => hideMobileNav.set(false);
	});

	onMount(() => {
		const prefs = get(settingsStore);
		tab = prefs.defaultAddTab;
		period = prefs.defaultPeriod;
	});
</script>

<SeoHead
	title="Add account"
	description="Add a TOTP account to LibreAuth by scanning a QR code or entering a secret key."
	robots="noindex, nofollow"
/>

<main class="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
	<a href="/app" class="neo-link hidden text-sm font-semibold md:inline">← Back to vault</a>

	<div class="neo-card mt-0 p-4 sm:mt-6 sm:p-8">
		<span class="neo-badge">Import</span>
		<h1 class="neo-heading mt-3 text-2xl font-bold sm:text-3xl">Add account</h1>
		<p class="mt-2 text-sm font-medium text-(--app-muted)">
			Scan a QR code, paste a setup link, or type the secret manually.
		</p>

		<div class="mt-6 grid grid-cols-3 gap-2">
			<button
				type="button"
				onclick={() => switchTab('scan')}
				class="neo-btn w-full py-2.5 text-xs sm:text-sm {tab === 'scan'
					? 'neo-btn-primary'
					: 'neo-btn-ghost'}"
			>
				<i class="fa-solid fa-camera"></i>
				Scan
			</button>
			<button
				type="button"
				onclick={() => switchTab('paste')}
				class="neo-btn w-full py-2 text-xs sm:text-sm {tab === 'paste'
					? 'neo-btn-primary'
					: 'neo-btn-ghost'}"
			>
				Paste
			</button>
			<button
				type="button"
				onclick={() => switchTab('manual')}
				class="neo-btn w-full py-2 text-xs sm:text-sm {tab === 'manual'
					? 'neo-btn-primary'
					: 'neo-btn-ghost'}"
			>
				Manual
			</button>
		</div>

		{#if pending}
			<div class="mt-6 space-y-4">
				<div class="neo-card-sm p-4">
					<p class="text-xs font-bold tracking-[0.12em] text-(--app-muted) uppercase">
						Ready to add
					</p>
					<p class="mt-2 text-xl font-bold">{previewTitle}</p>
					{#if previewSubtitle}
						<p class="text-sm font-medium text-(--app-muted)">{previewSubtitle}</p>
					{/if}
					<p class="mt-3 text-xs font-semibold text-(--app-muted)">
						{digits}-digit code · {period}s rotation · {algorithm}
					</p>
				</div>

				<div class="grid gap-2 sm:grid-cols-2">
					<button
						type="button"
						disabled={loading}
						onclick={savePending}
						class="neo-btn neo-btn-primary w-full py-3 disabled:opacity-50"
					>
						{loading ? 'Saving…' : 'Add to vault'}
					</button>
					<button
						type="button"
						disabled={loading}
						onclick={resetForm}
						class="neo-btn neo-btn-ghost w-full py-3 disabled:opacity-50"
					>
						Scan another
					</button>
				</div>
			</div>
		{:else if tab === 'scan'}
			<div class="mt-6 space-y-4">
				<QrScanner active={!pending} onScan={handleScan} onError={(message) => (error = message)} />
				<p class="text-xs leading-6 font-medium text-(--app-muted)">
					Open your service’s 2FA settings, choose authenticator app, and scan the QR code shown on
					screen.
				</p>
			</div>
		{:else if tab === 'paste'}
			<div class="mt-6 space-y-4">
				<div>
					<label for="uri" class="neo-label">otpauth:// URI</label>
					<textarea
						id="uri"
						bind:value={otpUri}
						rows="4"
						placeholder="otpauth://totp/Example:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
						class="neo-textarea"
					></textarea>
				</div>
				<button type="button" onclick={applyUri} class="neo-btn neo-btn-secondary w-full">
					Parse & review
				</button>
			</div>
		{:else}
			<form class="mt-6 space-y-4" onsubmit={submitManual}>
				<div>
					<label for="issuer" class="neo-label">Issuer (optional)</label>
					<input id="issuer" bind:value={issuer} placeholder="GitHub" class="neo-input" />
				</div>
				<div>
					<label for="name" class="neo-label">Account name</label>
					<input
						id="name"
						bind:value={name}
						required
						placeholder="you@example.com"
						class="neo-input"
					/>
				</div>
				<div>
					<label for="secret" class="neo-label">Secret key (Base32)</label>
					<input
						id="secret"
						bind:value={secret}
						required
						spellcheck="false"
						autocapitalize="off"
						class="neo-input neo-code tracking-normal"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="neo-btn neo-btn-primary w-full py-3 disabled:opacity-50"
				>
					{loading ? 'Saving…' : 'Save account'}
				</button>
			</form>
		{/if}

		{#if error}
			<p
				class="mt-4 border-[3px] border-(--app-border) bg-(--app-accent-alt) px-3 py-2 text-sm font-bold"
			>
				{error}
			</p>
		{/if}
	</div>
</main>
