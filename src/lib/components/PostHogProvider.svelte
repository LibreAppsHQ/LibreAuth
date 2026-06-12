<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { cookieConsentGiven } from '$lib/stores/cookieConsent';
	import {
		capturePageview,
		identifyUser,
		initPostHog,
		isPostHogConfigured,
		resetPostHogUser,
		shutdownPostHog
	} from '$lib/posthog';

	$effect(() => {
		if (!browser || !isPostHogConfigured()) return;

		if ($cookieConsentGiven) {
			initPostHog();
		} else {
			shutdownPostHog();
		}
	});

	$effect(() => {
		if (!browser || !$cookieConsentGiven || !isPostHogConfigured()) return;

		capturePageview(page.url.pathname, page.url.search);
	});

	$effect(() => {
		if (!browser || !$cookieConsentGiven || !isPostHogConfigured()) return;

		const user = page.data.user as { id: string; email?: string | null } | null | undefined;

		if (user?.id) {
			identifyUser(user);
		} else {
			resetPostHogUser();
		}
	});
</script>
