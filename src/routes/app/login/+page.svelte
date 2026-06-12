<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { isTurnstileEnabled } from '$lib/turnstile';

	let email = $state('');
	let password = $state('');
	let turnstileToken = $state('');
	let error = $state(page.url.searchParams.get('error') ?? '');
	let loading = $state(false);

	let turnstile = $state<Turnstile | undefined>();
	const turnstileRequired = isTurnstileEnabled();

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		if (turnstileRequired && !turnstileToken) {
			error = 'Complete the security check and try again.';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/app/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, turnstileToken })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				if (payload.error?.toLowerCase().includes('email not confirmed')) {
					goto(`/app/verify-email?email=${encodeURIComponent(email)}`);
					return;
				}
				error = payload.error ?? 'Could not sign in.';
				turnstile?.reset();
				return;
			}

			await invalidate('supabase:auth');
			goto('/app');
		} catch {
			error = 'Could not sign in. Check your connection and try again.';
			turnstile?.reset();
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead
	title="Sign in"
	description="Sign in to LibreAuth to access your synced TOTP authenticator vault."
	robots="noindex, nofollow"
/>

<main
	class="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-4 py-8 sm:min-h-[70vh] sm:px-6 sm:py-12"
>
	<div class="neo-card p-6 sm:p-8">
		<span class="neo-badge">Login</span>
		<h1 class="neo-heading mt-4 text-3xl font-bold">Sign in</h1>
		<p class="mt-2 text-sm font-medium text-(--app-muted)">
			Get back to your codes. You stay signed in on this device until you sign out.
		</p>

		<form class="mt-8 space-y-4" onsubmit={submit}>
			<div>
				<label for="email" class="neo-label">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					class="neo-input"
				/>
			</div>
			<div>
				<div class="flex items-center justify-between gap-2">
					<label for="password" class="neo-label">Password</label>
					<a
						href="/app/forgot-password"
						class="text-xs font-bold text-(--app-muted) hover:text-(--app-text)"
					>
						Forgot password?
					</a>
				</div>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
					class="neo-input"
				/>
			</div>

			<Turnstile bind:this={turnstile} bind:token={turnstileToken} />

			{#if error}
				<p
					class="border-[3px] border-(--app-border) bg-(--app-accent-alt) px-3 py-2 text-sm font-bold"
				>
					{error}
				</p>
			{/if}

			<button
				type="submit"
				disabled={loading || (turnstileRequired && !turnstileToken)}
				class="neo-btn neo-btn-primary w-full py-3.5 disabled:opacity-50"
			>
				{loading ? 'Signing in…' : 'Sign in'}
			</button>
		</form>

		<p class="mt-6 text-center text-sm font-semibold text-(--app-muted)">
			New here?
			<a href="/app/register" class="neo-link">Register</a>
		</p>
	</div>
</main>
