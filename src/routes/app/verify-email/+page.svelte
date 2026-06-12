<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { isTurnstileEnabled } from '$lib/turnstile';

	let resendMsg = $state('');
	let resendError = $state(page.url.searchParams.get('error') ?? '');
	let resending = $state(false);
	let turnstileToken = $state('');
	let otp = $state('');
	let otpLoading = $state(false);

	let turnstile = $state<Turnstile | undefined>();
	const turnstileRequired = isTurnstileEnabled();

	const email = $derived(page.url.searchParams.get('email')?.trim() ?? '');

	async function verifyCode(e: Event) {
		e.preventDefault();
		if (!email) {
			resendError = 'No email address on file. Register again or sign in.';
			return;
		}

		if (otp.trim().length < 6) {
			resendError = 'Enter the 6-digit code from your email.';
			return;
		}

		otpLoading = true;
		resendError = '';

		try {
			const response = await fetch('/app/auth/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, token: otp.trim(), type: 'email' })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				resendError = payload.error ?? 'Invalid or expired code.';
				return;
			}

			await invalidateAll();
			goto('/app');
		} catch {
			resendError = 'Could not verify code. Try again.';
		} finally {
			otpLoading = false;
		}
	}

	async function resendEmail() {
		if (!email) {
			resendError = 'No email address on file. Register again or sign in.';
			return;
		}

		if (turnstileRequired && !turnstileToken) {
			resendError = 'Complete the security check and try again.';
			return;
		}

		resending = true;
		resendMsg = '';
		resendError = '';

		try {
			const response = await fetch('/app/auth/resend-verification', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, turnstileToken })
			});

			const payload = (await response.json()) as { error?: string; ok?: boolean };

			if (!response.ok) {
				resendError = payload.error ?? 'Could not resend verification email.';
				turnstile?.reset();
				return;
			}

			resendMsg = 'Verification email sent. Check your inbox and spam folder.';
			turnstile?.reset();
		} catch {
			resendError = 'Could not resend verification email. Try again.';
			turnstile?.reset();
		} finally {
			resending = false;
		}
	}
</script>

<SeoHead
	title="Verify email"
	description="Confirm your LibreAuth account email address to activate sync."
	robots="noindex, nofollow"
/>

<main
	class="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-4 py-8 sm:min-h-[70vh] sm:px-6 sm:py-12"
>
	<div class="neo-card p-6 sm:p-8">
		<span class="neo-badge neo-badge-alt">Almost there</span>
		<h1 class="neo-heading mt-4 text-3xl font-bold">Verify your email</h1>
		<p class="mt-2 text-sm font-medium text-(--app-muted)">
			We sent a confirmation link{#if email}&nbsp;to <span class="font-bold text-(--app-text)"
					>{email}</span
				>{/if}. Click the link or enter the 6-digit code from the email.
		</p>

		<div class="mt-8 space-y-4">
			<form class="space-y-3" onsubmit={verifyCode}>
				<div>
					<label for="otp" class="neo-label">6-digit code</label>
					<input
						id="otp"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength="6"
						bind:value={otp}
						class="neo-input text-center font-mono text-lg tracking-[0.3em]"
						placeholder="000000"
					/>
				</div>
				<button
					type="submit"
					disabled={otpLoading || !email}
					class="neo-btn neo-btn-primary w-full py-3 disabled:opacity-50"
				>
					{otpLoading ? 'Verifying…' : 'Verify with code'}
				</button>
			</form>

			{#if resendError}
				<p
					class="border-[3px] border-(--app-border) bg-(--app-accent-alt) px-3 py-2 text-sm font-bold"
				>
					{resendError}
				</p>
			{/if}

			{#if resendMsg}
				<p class="neo-settings-success">{resendMsg}</p>
			{/if}

			<Turnstile bind:this={turnstile} bind:token={turnstileToken} />

			<button
				type="button"
				disabled={resending || !email || (turnstileRequired && !turnstileToken)}
				onclick={resendEmail}
				class="neo-btn neo-btn-secondary w-full py-3 disabled:opacity-50"
			>
				{resending ? 'Sending…' : 'Resend verification email'}
			</button>

			<a href="/app/login" class="neo-btn neo-btn-ghost w-full py-3 text-center">Go to sign in</a>
		</div>

		<p class="mt-6 text-center text-sm font-semibold text-(--app-muted)">
			Wrong address?
			<a href="/app/register" class="neo-link">Register again</a>
		</p>
	</div>
</main>
