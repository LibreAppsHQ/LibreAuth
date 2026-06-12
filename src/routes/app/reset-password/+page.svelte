<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { isTurnstileEnabled } from '$lib/turnstile';

	let password = $state('');
	let confirm = $state('');
	let turnstileToken = $state('');
	let error = $state('');
	let loading = $state(false);

	let turnstile = $state<Turnstile | undefined>();
	const turnstileRequired = isTurnstileEnabled();

	async function submit(e: Event) {
		e.preventDefault();
		error = '';

		if (password.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}

		if (password !== confirm) {
			error = 'Passwords do not match.';
			return;
		}

		if (turnstileRequired && !turnstileToken) {
			error = 'Complete the security check and try again.';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/app/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password, turnstileToken })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				error = payload.error ?? 'Could not update password.';
				turnstile?.reset();
				return;
			}

			await invalidate('supabase:auth');
			goto('/app');
		} catch {
			error = 'Could not update password. Check your connection and try again.';
			turnstile?.reset();
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead
	title="Reset password"
	description="Choose a new password for your LibreAuth account."
	robots="noindex, nofollow"
/>

<main
	class="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-4 py-8 sm:min-h-[70vh] sm:px-6 sm:py-12"
>
	<div class="neo-card p-6 sm:p-8">
		<span class="neo-badge neo-badge-alt">Security</span>
		<h1 class="neo-heading mt-4 text-3xl font-bold">Choose a new password</h1>
		<p class="mt-2 text-sm font-medium text-(--app-muted)">
			At least 8 characters. Then you&apos;re back in.
		</p>

		<form class="mt-8 space-y-4" onsubmit={submit}>
			<div>
				<label for="password" class="neo-label">New password</label>
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
				{loading ? 'Updating…' : 'Update password'}
			</button>
		</form>

		<p class="mt-6 text-center text-sm font-semibold text-(--app-muted)">
			Code expired?
			<a href="/app/forgot-password" class="neo-link">Get a new one</a>
		</p>
	</div>
</main>
