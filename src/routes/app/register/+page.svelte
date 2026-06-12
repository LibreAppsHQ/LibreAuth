<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { isTurnstileEnabled } from '$lib/turnstile';

	let email = $state('');
	let password = $state('');
	let confirm = $state('');
	let turnstileToken = $state('');
	let error = $state('');
	let loading = $state(false);

	let turnstile = $state<Turnstile | undefined>();
	const turnstileRequired = isTurnstileEnabled();

	async function submit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		if (password !== confirm) {
			error = 'Passwords do not match.';
			loading = false;
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters.';
			loading = false;
			return;
		}

		if (turnstileRequired && !turnstileToken) {
			error = 'Complete the security check and try again.';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/app/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, turnstileToken })
			});

			const payload = (await response.json()) as {
				error?: string;
				ok?: boolean;
				needsVerification?: boolean;
				email?: string;
			};

			if (!response.ok) {
				error = payload.error ?? 'Could not create account.';
				turnstile?.reset();
				return;
			}

			if (payload.needsVerification) {
				goto(`/app/verify-email?email=${encodeURIComponent(payload.email ?? email)}`);
				return;
			}

			await invalidate('supabase:auth');
			goto('/app');
		} catch {
			error = 'Could not create account. Check your connection and try again.';
			turnstile?.reset();
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead
	title="Create account"
	description="Create a free LibreAuth account to sync TOTP codes across devices with Supabase."
	robots="noindex, nofollow"
/>

<main
	class="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-4 py-8 sm:min-h-[70vh] sm:px-6 sm:py-12"
>
	<div class="neo-card p-6 sm:p-8">
		<span class="neo-badge neo-badge-alt">New</span>
		<h1 class="neo-heading mt-4 text-3xl font-bold">Create account</h1>
		<p class="mt-2 text-sm font-medium text-(--app-muted)">Free sync. No credit card theatre.</p>

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
				<label for="password" class="neo-label">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					autocomplete="new-password"
					class="neo-input"
				/>
			</div>
			<div>
				<label for="confirm" class="neo-label">Confirm password</label>
				<input
					id="confirm"
					type="password"
					bind:value={confirm}
					required
					autocomplete="new-password"
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
				{loading ? 'Creating…' : 'Create account'}
			</button>
		</form>

		<p class="mt-6 text-center text-sm font-semibold text-(--app-muted)">
			Have an account?
			<a href="/app/login" class="neo-link">Sign in</a>
		</p>
	</div>
</main>
