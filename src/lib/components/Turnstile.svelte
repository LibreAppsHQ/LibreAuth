<script lang="ts">
	import { onMount } from 'svelte';
	import { getTurnstileSiteKey, isTurnstileEnabled, loadTurnstileScript } from '$lib/turnstile';

	let { token = $bindable('') } = $props<{ token?: string }>();

	let container = $state<HTMLDivElement | null>(null);
	let widgetId = $state<string | undefined>();

	const siteKey = getTurnstileSiteKey();
	const enabled = isTurnstileEnabled();

	export function reset() {
		token = '';
		if (widgetId !== undefined && window.turnstile) {
			window.turnstile.reset(widgetId);
		}
	}

	onMount(() => {
		if (!enabled || !container) return;

		let cancelled = false;

		void loadTurnstileScript()
			.then(() => {
				if (cancelled || !container || !window.turnstile) return;

				widgetId = window.turnstile.render(container, {
					sitekey: siteKey,
					theme: 'auto',
					callback: (value: string) => {
						token = value;
					},
					'expired-callback': () => {
						token = '';
					},
					'error-callback': () => {
						token = '';
					}
				});
			})
			.catch(() => {
				token = '';
			});

		return () => {
			cancelled = true;
			if (widgetId !== undefined && window.turnstile) {
				window.turnstile.remove(widgetId);
			}
		};
	});
</script>

{#if enabled}
	<div bind:this={container} class="neo-turnstile" aria-label="Security check"></div>
{/if}
