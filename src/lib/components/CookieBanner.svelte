<script lang="ts">
	import { page } from '$app/state';
	import { acceptCookies, cookieConsentGiven } from '$lib/stores/cookieConsent';

	const AUTH_PATHS = new Set(['/app/login', '/app/register']);

	let inAppShell = $derived(
		page.url.pathname.startsWith('/app') && !AUTH_PATHS.has(page.url.pathname)
	);
</script>

{#if !$cookieConsentGiven}
	<div
		class="neo-cookie-banner"
		class:neo-cookie-banner--app={inAppShell}
		role="dialog"
		aria-labelledby="cookie-banner-title"
		aria-describedby="cookie-banner-desc"
	>
		<div class="neo-cookie-banner-inner neo-card-sm">
			<div class="flex items-start gap-3">
				<div
					class="hidden h-11 w-11 shrink-0 items-center justify-center border-[3px] border-(--app-border) bg-(--app-accent-alt2) text-lg shadow-[3px_3px_0_var(--app-shadow-color)] sm:flex"
					aria-hidden="true"
				>
					<i class="fa-solid fa-cookie-bite"></i>
				</div>

				<div class="min-w-0 flex-1">
					<p id="cookie-banner-title" class="text-sm font-bold sm:text-base">Cookies & storage</p>
					<p id="cookie-banner-desc" class="mt-2 text-sm leading-6 text-(--app-muted)">
						We use essential session cookies when you sign in, local storage for your theme, and
						optional PostHog analytics on marketing pages after you accept (never on your vault).
						<a href="/privacy#cookies" class="neo-link">Privacy details</a>
					</p>

					<div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
						<button
							type="button"
							onclick={acceptCookies}
							class="neo-btn neo-btn-primary w-full sm:w-auto"
						>
							Accept
						</button>
						<a href="/privacy#cookies" class="neo-btn neo-btn-ghost w-full sm:w-auto">Learn more</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
