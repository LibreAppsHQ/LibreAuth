<script lang="ts">
	import { invalidate } from '$app/navigation';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SettingsRow from '$lib/components/SettingsRow.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import SettingsToggle from '$lib/components/SettingsToggle.svelte';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import { resetCookieConsent } from '$lib/stores/cookieConsent';
	import { settingsStore, TOTP_PERIOD_OPTIONS, type AddTab } from '$lib/stores/settings';
	import { themeStore, themeKeys, themes, type ThemeKey } from '$lib/stores/theme';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { isTurnstileEnabled } from '$lib/turnstile';
	import { APP_VERSION } from '$lib/version';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	type Tab = 'general' | 'vault' | 'account' | 'data';

	const tabs: { id: Tab; label: string; icon: string }[] = [
		{ id: 'general', label: 'General', icon: 'fa-palette' },
		{ id: 'vault', label: 'Vault', icon: 'fa-shield-halved' },
		{ id: 'account', label: 'Account', icon: 'fa-user' },
		{ id: 'data', label: 'Data', icon: 'fa-database' }
	];

	const addTabOptions: { value: AddTab; label: string }[] = [
		{ value: 'scan', label: 'Scan QR' },
		{ value: 'paste', label: 'Paste URI' },
		{ value: 'manual', label: 'Manual key' }
	];

	let activeTab = $state<Tab>('general');
	const supabase = createSupabaseBrowserClient();

	let newPassword = $state('');
	let confirmPassword = $state('');
	let accountPassword = $state('');
	let passwordMsg = $state('');
	let passwordError = $state('');
	let passwordLoading = $state(false);
	let dataMsg = $state('');
	let dataError = $state('');
	let dataLoading = $state(false);
	let deleteConfirm = $state('');
	let deleteTurnstileToken = $state('');
	let vaultMsg = $state('');
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmLabel = $state('Confirm');
	let confirmDanger = $state(false);
	let confirmAction = $state<(() => Promise<void>) | null>(null);

	let deleteTurnstile = $state<Turnstile | undefined>();
	const turnstileRequired = isTurnstileEnabled();

	function openConfirm(options: {
		title: string;
		message: string;
		confirmLabel?: string;
		danger?: boolean;
		action: () => Promise<void>;
	}) {
		confirmTitle = options.title;
		confirmMessage = options.message;
		confirmLabel = options.confirmLabel ?? 'Confirm';
		confirmDanger = options.danger ?? false;
		confirmAction = options.action;
		confirmOpen = true;
	}

	async function runConfirmAction() {
		if (!confirmAction) return;
		await confirmAction();
	}

	async function changePassword(e: Event) {
		e.preventDefault();
		passwordMsg = '';
		passwordError = '';

		if (newPassword.length < 8) {
			passwordError = 'Password must be at least 8 characters.';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match.';
			return;
		}

		passwordLoading = true;

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: data.user?.email ?? '',
			password: accountPassword
		});

		if (signInError) {
			passwordError = 'Current password is incorrect.';
			passwordLoading = false;
			return;
		}

		const { error } = await supabase.auth.updateUser({ password: newPassword });
		passwordLoading = false;

		if (error) {
			passwordError = error.message;
			return;
		}

		newPassword = '';
		confirmPassword = '';
		accountPassword = '';
		passwordMsg = 'Password updated.';
	}

	function setTab(tab: Tab) {
		activeTab = tab;
	}

	async function applyPeriodToVault() {
		const period = $settingsStore.defaultPeriod;

		openConfirm({
			title: 'Apply code interval?',
			message: `Set every saved account to ${period}s codes. Only continue if your services actually use that interval — wrong timing means invalid codes.`,
			confirmLabel: `Apply ${period}s`,
			action: async () => {
				vaultMsg = '';
				dataError = '';
				dataLoading = true;

				const {
					data: { user }
				} = await supabase.auth.getUser();

				if (!user) {
					dataError = 'Not signed in.';
					dataLoading = false;
					return;
				}

				const { error } = await supabase
					.from('totp_entries')
					.update({ period })
					.eq('user_id', user.id);
				dataLoading = false;

				if (error) {
					dataError = error.message;
					return;
				}

				await invalidate('app:entries');
				vaultMsg = `Updated all vault accounts to ${period}s codes.`;
			}
		});
	}

	async function deleteAllEntries() {
		openConfirm({
			title: 'Delete all entries?',
			message: 'Every TOTP account will be removed from your vault. This cannot be undone.',
			confirmLabel: 'Delete all',
			danger: true,
			action: async () => {
				dataMsg = '';
				dataError = '';
				dataLoading = true;

				const {
					data: { user }
				} = await supabase.auth.getUser();

				if (!user) {
					dataError = 'Not signed in.';
					dataLoading = false;
					return;
				}

				const { error } = await supabase.from('totp_entries').delete().eq('user_id', user.id);
				dataLoading = false;

				if (error) {
					dataError = error.message;
					return;
				}

				await invalidate('app:entries');
				dataMsg = 'All vault entries deleted.';
			}
		});
	}

	function requestDeleteAccount() {
		if (deleteConfirm !== 'DELETE') {
			dataError = 'Type DELETE to confirm account removal.';
			return;
		}

		if (turnstileRequired && !deleteTurnstileToken) {
			dataError = 'Complete the security check and try again.';
			return;
		}

		dataError = '';

		openConfirm({
			title: 'Delete your account?',
			message:
				'This permanently removes your login, synced vault, and all saved codes from LibreAuth.',
			confirmLabel: 'Delete account',
			danger: true,
			action: deleteAccount
		});
	}

	async function deleteAccount() {
		dataMsg = '';
		dataError = '';
		dataLoading = true;

		try {
			const response = await fetch('/app/auth/delete-account', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ confirm: deleteConfirm, turnstileToken: deleteTurnstileToken })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				dataError = payload.error ?? 'Could not delete account.';
				deleteTurnstile?.reset();
				return;
			}

			window.location.href = '/';
		} catch {
			dataError = 'Could not delete account. Check your connection and try again.';
			deleteTurnstile?.reset();
		} finally {
			dataLoading = false;
		}
	}

	async function exportVault() {
		dataMsg = '';
		dataError = '';
		dataLoading = true;

		const { data: entries, error } = await supabase
			.from('totp_entries')
			.select('*')
			.order('created_at');

		dataLoading = false;

		if (error) {
			dataError = error.message;
			return;
		}

		const blob = new Blob([JSON.stringify(entries ?? [], null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `libreauth-vault-${new Date().toISOString().slice(0, 10)}.json`;
		anchor.click();
		URL.revokeObjectURL(url);
		dataMsg = `Exported ${entries?.length ?? 0} account(s). Keep that file private — it contains secrets.`;
	}

	function selectTheme(key: ThemeKey) {
		themeStore.setTheme(key);
	}
</script>

<ConfirmDialog
	bind:open={confirmOpen}
	title={confirmTitle}
	message={confirmMessage}
	{confirmLabel}
	danger={confirmDanger}
	loading={dataLoading}
	onconfirm={runConfirmAction}
/>

<SeoHead
	title="Settings"
	description="LibreAuth account and vault settings."
	robots="noindex, nofollow"
/>

<main class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
	<a href="/app" class="neo-link mb-4 inline-flex min-h-11 items-center text-sm font-semibold">
		← Back to vault
	</a>

	<div class="mb-6">
		<span class="neo-badge">Control panel</span>
		<h1 class="neo-heading mt-3 text-3xl font-bold sm:text-4xl">Settings</h1>
		<p class="mt-1 text-sm font-semibold text-(--app-muted)">
			Organized by area — pick a tab, change what you need.
		</p>
	</div>

	<nav class="neo-settings-tabs mb-8" aria-label="Settings sections">
		{#each tabs as tab}
			<button
				type="button"
				onclick={() => setTab(tab.id)}
				class="neo-settings-tab {activeTab === tab.id ? 'neo-settings-tab-active' : ''}"
				aria-current={activeTab === tab.id ? 'page' : undefined}
			>
				<i class="fa-solid {tab.icon}"></i>
				{tab.label}
			</button>
		{/each}
	</nav>

	{#if dataError}
		<p class="neo-settings-alert mb-6">{dataError}</p>
	{/if}

	{#if activeTab === 'general'}
		<div class="space-y-8">
			<SettingsSection
				id="themes"
				title="Theme"
				description="Colors and contrast for the whole app."
			>
				<SettingsRow>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each themeKeys as key}
							<button
								type="button"
								onclick={() => selectTheme(key)}
								class="neo-card-sm p-4 text-left active:translate-x-0.5 {$themeStore === key
									? 'ring-2 ring-(--app-accent)'
									: ''}"
							>
								<div class="flex gap-2">
									<span
										class="h-7 w-7 border-[3px] border-(--app-border) shadow-[2px_2px_0_var(--app-shadow-color)]"
										style="background: {themes[key].accent}"
									></span>
									<span
										class="h-7 w-7 border-[3px] border-(--app-border) shadow-[2px_2px_0_var(--app-shadow-color)]"
										style="background: {themes[key].accentAlt}"
									></span>
									<span
										class="h-7 w-7 border-[3px] border-(--app-border) shadow-[2px_2px_0_var(--app-shadow-color)]"
										style="background: {themes[key].accentAlt2}"
									></span>
								</div>
								<p class="mt-3 text-sm font-bold">{themes[key].name}</p>
								<p class="mt-1 text-xs leading-5 text-(--app-muted)">{themes[key].description}</p>
							</button>
						{/each}
					</div>
				</SettingsRow>

				<SettingsRow>
					<SettingsToggle
						checked={$settingsStore.reduceMotion}
						label="Reduce motion"
						description="Turn off animations and transitions."
						onchange={(value) => settingsStore.updateSetting('reduceMotion', value)}
					/>
				</SettingsRow>
			</SettingsSection>
		</div>
	{:else if activeTab === 'vault'}
		<div class="space-y-8">
			<SettingsSection
				id="codes"
				title="Code timer"
				description="How long each TOTP code stays valid before it rotates."
			>
				<SettingsRow>
					<p class="text-sm font-bold">Refresh interval</p>
					<p class="mt-1 text-xs leading-5 text-(--app-muted)">
						Default for new accounts. QR codes usually set this automatically — only change it if
						you know your service uses a different interval.
					</p>
					<div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
						{#each TOTP_PERIOD_OPTIONS as seconds}
							<button
								type="button"
								onclick={() => settingsStore.updateSetting('defaultPeriod', seconds)}
								class="neo-btn w-full py-2.5 text-sm {$settingsStore.defaultPeriod === seconds
									? 'neo-btn-primary'
									: 'neo-btn-ghost'}"
							>
								{seconds}s
							</button>
						{/each}
					</div>
					<p class="mt-3 text-xs font-semibold text-(--app-muted)">
						Selected: {$settingsStore.defaultPeriod}s per code
					</p>
				</SettingsRow>

				<SettingsRow>
					<p class="text-sm font-bold">Existing accounts</p>
					<p class="mt-1 text-xs leading-5 text-(--app-muted)">
						Apply the interval above to every account already in your vault.
					</p>
					<button
						type="button"
						disabled={dataLoading}
						onclick={applyPeriodToVault}
						class="neo-btn neo-btn-secondary mt-4 text-sm disabled:opacity-50"
					>
						Apply {$settingsStore.defaultPeriod}s to all accounts
					</button>
					{#if vaultMsg}
						<p class="neo-settings-success mt-3">{vaultMsg}</p>
					{/if}
				</SettingsRow>
			</SettingsSection>

			<SettingsSection
				id="vault-ui"
				title="Vault behavior"
				description="Layout and interaction defaults."
			>
				<SettingsRow>
					<SettingsToggle
						checked={$settingsStore.showIssuerLogos}
						label="Site logos"
						description="Use each service's favicon instead of the letter avatar. Icons load from the issuer domain."
						onchange={(value) => settingsStore.updateSetting('showIssuerLogos', value)}
					/>
				</SettingsRow>

				<SettingsRow>
					<SettingsToggle
						checked={$settingsStore.compactVault}
						label="Compact cards"
						description="Smaller cards and tighter spacing on the vault screen."
						onchange={(value) => settingsStore.updateSetting('compactVault', value)}
					/>
				</SettingsRow>

				<SettingsRow>
					<SettingsToggle
						checked={$settingsStore.copyVibrate}
						label="Vibrate on copy"
						description="Short pulse when a code is copied (supported phones only)."
						onchange={(value) => settingsStore.updateSetting('copyVibrate', value)}
					/>
				</SettingsRow>

				<SettingsRow>
					<p class="text-sm font-bold">Default add method</p>
					<p class="mt-1 text-xs text-(--app-muted)">First tab when you open add account.</p>
					<div class="mt-3 grid grid-cols-3 gap-2">
						{#each addTabOptions as option}
							<button
								type="button"
								onclick={() => settingsStore.updateSetting('defaultAddTab', option.value)}
								class="neo-btn w-full py-2 text-xs {$settingsStore.defaultAddTab === option.value
									? 'neo-btn-primary'
									: 'neo-btn-ghost'}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</SettingsRow>

				<SettingsRow>
					<button
						type="button"
						onclick={() => settingsStore.resetPreferences()}
						class="neo-btn neo-btn-ghost text-sm"
					>
						Reset vault preferences
					</button>
				</SettingsRow>
			</SettingsSection>
		</div>
	{:else if activeTab === 'account'}
		<SettingsSection
			id="account"
			title="Your account"
			description="Signed in as {data.user?.email ?? 'unknown'}."
		>
			<SettingsRow>
				<form class="space-y-4" onsubmit={changePassword}>
					<p class="text-sm font-bold">Change password</p>
					<div>
						<label for="current-password" class="neo-label">Current password</label>
						<input
							id="current-password"
							type="password"
							bind:value={accountPassword}
							required
							autocomplete="current-password"
							class="neo-input"
						/>
					</div>
					<div>
						<label for="new-password" class="neo-label">New password</label>
						<input
							id="new-password"
							type="password"
							bind:value={newPassword}
							required
							minlength="8"
							autocomplete="new-password"
							class="neo-input"
						/>
					</div>
					<div>
						<label for="confirm-password" class="neo-label">Confirm new password</label>
						<input
							id="confirm-password"
							type="password"
							bind:value={confirmPassword}
							required
							minlength="8"
							autocomplete="new-password"
							class="neo-input"
						/>
					</div>

					{#if passwordError}
						<p class="neo-settings-alert">{passwordError}</p>
					{/if}
					{#if passwordMsg}
						<p class="neo-settings-success">{passwordMsg}</p>
					{/if}

					<button
						type="submit"
						disabled={passwordLoading}
						class="neo-btn neo-btn-secondary disabled:opacity-50"
					>
						{passwordLoading ? 'Updating…' : 'Update password'}
					</button>
				</form>
			</SettingsRow>

			<SettingsRow>
				<a href="/app/auth/logout" class="neo-btn neo-btn-ghost">
					<i class="fa-solid fa-right-from-bracket"></i> Sign out
				</a>
			</SettingsRow>
		</SettingsSection>
	{:else}
		<div class="space-y-8">
			<SettingsSection
				id="vault-data"
				title="Vault data"
				description="Export or remove synced TOTP entries."
			>
				<SettingsRow>
					<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
						<button
							type="button"
							disabled={dataLoading}
							onclick={exportVault}
							class="neo-btn neo-btn-secondary disabled:opacity-50"
						>
							<i class="fa-solid fa-download"></i> Export JSON
						</button>
						<button
							type="button"
							disabled={dataLoading}
							onclick={deleteAllEntries}
							class="neo-btn neo-btn-ghost disabled:opacity-50"
						>
							<i class="fa-solid fa-trash-can"></i> Delete all entries
						</button>
					</div>
					{#if dataMsg}
						<p class="neo-settings-success mt-4">{dataMsg}</p>
					{/if}
				</SettingsRow>
			</SettingsSection>

			<SettingsSection id="danger" title="Danger zone">
				<SettingsRow>
					<p class="text-sm font-bold text-(--app-accent-alt)">Delete account</p>
					<p class="mt-1 text-xs leading-5 text-(--app-muted)">
						Removes your login and vault permanently. Type DELETE to confirm.
					</p>
					<div class="mt-3 flex flex-col gap-2 sm:flex-row">
						<input
							type="text"
							bind:value={deleteConfirm}
							placeholder="DELETE"
							class="neo-input sm:max-w-xs"
							autocomplete="off"
						/>
						<button
							type="button"
							disabled={dataLoading || (turnstileRequired && !deleteTurnstileToken)}
							onclick={requestDeleteAccount}
							class="neo-btn neo-btn-danger disabled:opacity-50"
						>
							Delete my account
						</button>
					</div>
					<div class="mt-3">
						<Turnstile bind:this={deleteTurnstile} bind:token={deleteTurnstileToken} />
					</div>
				</SettingsRow>
			</SettingsSection>

			<SettingsSection id="privacy" title="Privacy & about">
				<SettingsRow>
					<p class="text-sm font-bold">Privacy</p>
					<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
						<button
							type="button"
							onclick={resetCookieConsent}
							class="neo-btn neo-btn-ghost text-sm"
						>
							Reset cookie banner
						</button>
						<a href="/privacy#cookies" class="neo-btn neo-btn-ghost text-sm">Cookies</a>
						<a href="/privacy" class="neo-btn neo-btn-ghost text-sm">Privacy policy</a>
					</div>
				</SettingsRow>

				<SettingsRow>
					<p class="text-sm font-bold">About LibreAuth</p>
					<p class="mt-1 text-sm text-(--app-muted)">Version {APP_VERSION}</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<a href="/" class="neo-btn neo-btn-ghost text-sm">Site</a>
						<a href="/security" class="neo-btn neo-btn-ghost text-sm">Security</a>
						<a
							href="https://github.com/Arcbasehq/LibreAuth"
							target="_blank"
							rel="noopener noreferrer"
							class="neo-btn neo-btn-ghost text-sm"
						>
							<i class="fa-brands fa-github"></i> Source
						</a>
					</div>
				</SettingsRow>
			</SettingsSection>
		</div>
	{/if}
</main>
