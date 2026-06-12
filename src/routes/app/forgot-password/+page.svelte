<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { isTurnstileEnabled } from '$lib/turnstile';

	type Step = 'email' | 'code';

	let step = $state<Step>('email');
	let email = $state(page.url.searchParams.get('email')?.trim() ?? '');
	let turnstileToken = $state('');
	let error = $state(page.url.searchParams.get('error') ?? '');
	let info = $state('');
	let sendLoading = $state(false);
	let code = $state('');
	let verifyLoading = $state(false);

	let turnstile = $state<Turnstile | undefined>();
	const turnstileRequired = isTurnstileEnabled();

	async function sendCode(e: Event) {
		e.preventDefault();
		sendLoading = true;
		error = '';
		info = '';

		if (turnstileRequired && !turnstileToken) {
			error = 'Complete the security check and try again.';
			sendLoading = false;
			return;
		}

		try {
			const response = await fetch('/app/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, turnstileToken })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				error = payload.error ?? 'Could not send reset code.';
				turnstile?.reset();
				return;
			}

			step = 'code';
			code = '';
			info = `If an account exists for ${email}, we emailed a 6-digit code. Enter it below.`;
			turnstile?.reset();
		} catch {
			error = 'Could not send reset code. Check your connection and try again.';
			turnstile?.reset();
		} finally {
			sendLoading = false;
		}
	}

	async function verifyCode(e: Event) {
		e.preventDefault();
		error = '';

		if (code.trim().length < 6) {
			error = 'Enter the 6-digit code from your email.';
			return;
		}

		verifyLoading = true;

		try {
			const response = await fetch('/app/auth/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, token: code.trim(), type: 'recovery' })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				error = payload.error ?? 'Invalid or expired code.';
				return;
			}

			await invalidateAll();
			goto('/app/reset-password');
		} catch {
			error = 'Could not verify code. Try again.';
		} finally {
			verifyLoading = false;
		}
	}

	function useDifferentEmail() {
		step = 'email';
		code = '';
		error = '';
		info = '';
	}
</script>

<SeoHead
	title="Forgot password"
	description="Reset your LibreAuth password using a code sent to your email."
	robots="noindex, nofollow"
/>

<main
	class="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-4 py-8 sm:min-h-[70vh] sm:px-6 sm:py-12"
>
	<div class="neo-card p-6 sm:p-8">
		<span class="neo-badge">Account</span>
		<h1 class="neo-heading mt-4 text-3xl font-bold">Reset password</h1>

		{#if step === 'email'}
			<p class="mt-2 text-sm font-medium text-(--app-muted)">
				We&apos;ll email you a 6-digit code. Enter it here to choose a new password.
			</p>

			<form class="mt-8 space-y-4" onsubmit={sendCode}>
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
					disabled={sendLoading || (turnstileRequired && !turnstileToken)}
					class="neo-btn neo-btn-primary w-full py-3.5 disabled:opacity-50"
				>
					{sendLoading ? 'Sending…' : 'Send reset code'}
				</button>
			</form>
		{:else}
			<p class="mt-2 text-sm font-medium text-(--app-muted)">
				Check your inbox for a code sent to <span class="font-bold text-(--app-text)">{email}</span
				>.
			</p>

			<form class="mt-8 space-y-4" onsubmit={verifyCode}>
				{#if info}
					<p class="neo-settings-success">{info}</p>
				{/if}

				<div>
					<label for="code" class="neo-label">6-digit code</label>
					<input
						id="code"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength="6"
						bind:value={code}
						required
						class="neo-input text-center font-mono text-2xl tracking-[0.35em]"
						placeholder="000000"
					/>
				</div>

				{#if error}
					<p
						class="border-[3px] border-(--app-border) bg-(--app-accent-alt) px-3 py-2 text-sm font-bold"
					>
						{error}
					</p>
				{/if}

				<button
					type="submit"
					disabled={verifyLoading}
					class="neo-btn neo-btn-primary w-full py-3.5 disabled:opacity-50"
				>
					{verifyLoading ? 'Checking…' : 'Continue'}
				</button>

				<button type="button" onclick={useDifferentEmail} class="neo-btn neo-btn-ghost w-full py-3">
					Use a different email
				</button>
			</form>
		{/if}

		<p class="mt-6 text-center text-sm font-semibold text-(--app-muted)">
			Remember it?
			<a href="/app/login" class="neo-link">Back to sign in</a>
		</p>
	</div>
</main>
