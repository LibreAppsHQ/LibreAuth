<script lang="ts">
	import { browser } from '$app/environment';

	let { open = $bindable(false) } = $props<{ open?: boolean }>();

	const fakeAds = [
		{
			tag: 'Sponsored',
			headline: 'HOT SINGLES IN YOUR MFA VAULT',
			sub: 'Doctors hate this one weird TOTP trick.'
		},
		{
			tag: 'Limited time',
			headline: 'FREE SPYWARE WITH EVERY LOGIN',
			sub: 'Enterprise grey UI pack — only $999/mo forever.'
		},
		{
			tag: 'You won!',
			headline: 'CLICK HERE TO SELL YOUR 2FA CODES',
			sub: 'Trusted by 0 security professionals.'
		}
	] as const;

	let visibleCount = $state(0);
	let stamped = $state<boolean[]>([]);
	let showFinale = $state(false);
	let playing = $state(false);

	const reducedMotion = $derived(
		browser &&
			(document.documentElement.dataset.reduceMotion === '1' ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	function reset() {
		visibleCount = 0;
		stamped = fakeAds.map(() => false);
		showFinale = false;
		playing = false;
	}

	function close() {
		open = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (
			target.closest('.neo-ads-egg-finale') ||
			target.closest('.neo-ads-egg-popup') ||
			target.closest('.neo-ads-egg-dismiss')
		) {
			return;
		}
		if (showFinale || !playing) close();
	}

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function playSequence() {
		if (playing) return;
		playing = true;
		visibleCount = 0;
		stamped = fakeAds.map(() => false);
		showFinale = false;

		if (reducedMotion) {
			visibleCount = fakeAds.length;
			stamped = fakeAds.map(() => true);
			showFinale = true;
			playing = false;
			return;
		}

		for (let i = 0; i < fakeAds.length; i++) {
			visibleCount = i + 1;
			await sleep(420);
			stamped = stamped.map((value, index) => (index === i ? true : value));
			await sleep(480);
		}

		await sleep(320);
		showFinale = true;
		playing = false;
	}

	$effect(() => {
		if (open) {
			void playSequence();
		} else {
			reset();
		}
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (open && event.key === 'Escape') close();
	}}
/>

{#if open}
	<div class="neo-ads-egg-backdrop" role="presentation" onclick={handleBackdropClick}>
		<button
			type="button"
			class="neo-ads-egg-dismiss neo-btn neo-btn-ghost neo-btn-icon"
			aria-label="Close"
			onclick={close}
		>
			<i class="fa-solid fa-xmark"></i>
		</button>

		<div class="neo-ads-egg-stage" aria-live="polite">
			{#each fakeAds.slice(0, visibleCount) as ad, i}
				<article
					class="neo-ads-egg-popup neo-card-sm"
					class:neo-ads-egg-popup-stamped={stamped[i]}
					class:neo-ads-egg-popup-inert={showFinale || stamped[i]}
					style="--ad-i: {i}"
				>
					<p class="neo-badge text-[0.6rem]">{ad.tag}</p>
					<p class="mt-2 text-sm leading-snug font-bold">{ad.headline}</p>
					<p class="mt-1 text-xs font-medium text-(--app-muted)">{ad.sub}</p>
					<span class="neo-ads-egg-stamp" aria-hidden="true">BLOCKED</span>
				</article>
			{/each}

			{#if showFinale}
				<div
					class="neo-ads-egg-finale neo-card"
					role="dialog"
					aria-modal="true"
					aria-labelledby="neo-ads-egg-title"
					tabindex="-1"
				>
					<span class="neo-badge">Ad machine: offline</span>
					<h2 id="neo-ads-egg-title" class="neo-heading mt-3 text-2xl font-bold">
						Still no ads.<br />
						<span class="bg-(--app-accent-alt2) px-1.5">Obviously.</span>
					</h2>
					<p class="mt-3 text-sm leading-6 font-medium text-(--app-muted)">
						We ran the numbers. Monetizing your MFA codes felt… illegal. So we stamped out the
						pop-ups instead.
					</p>
					<button type="button" class="neo-btn neo-btn-primary mt-5 w-full" onclick={() => close()}>
						Good. Keep it that way.
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.neo-ads-egg-backdrop {
		position: fixed;
		inset: 0;
		z-index: 70;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--app-text) 55%, transparent);
		padding: max(1rem, var(--safe-top)) max(1rem, var(--safe-right)) max(1rem, var(--safe-bottom))
			max(1rem, var(--safe-left));
	}

	.neo-ads-egg-dismiss {
		position: absolute;
		top: max(1rem, var(--safe-top));
		right: max(1rem, var(--safe-right));
		z-index: 15;
		background: var(--app-card);
	}

	.neo-ads-egg-stage {
		position: relative;
		width: min(100%, 36rem);
		min-height: 18rem;
	}

	.neo-ads-egg-popup-inert {
		pointer-events: none;
	}

	.neo-ads-egg-popup-inert.neo-ads-egg-popup-stamped {
		opacity: 0.2;
	}

	.neo-ads-egg-popup {
		position: absolute;
		width: min(16rem, 78vw);
		padding: 0.85rem;
		animation: neo-ad-drop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) both;
		animation-delay: calc(var(--ad-i) * 40ms);
	}

	.neo-ads-egg-popup:nth-child(1) {
		top: 0;
		left: 0;
		transform: rotate(-3deg);
	}

	.neo-ads-egg-popup:nth-child(2) {
		top: 2.5rem;
		right: 0;
		transform: rotate(2deg);
		background: var(--app-accent-alt);
	}

	.neo-ads-egg-popup:nth-child(3) {
		bottom: 0;
		left: 18%;
		transform: rotate(-1deg);
		background: var(--app-accent-alt2);
	}

	.neo-ads-egg-stamp {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4px solid var(--app-danger, #c0392b);
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: var(--app-danger, #c0392b);
		opacity: 0;
		transform: scale(2) rotate(-12deg);
		pointer-events: none;
	}

	.neo-ads-egg-popup-stamped {
		animation: neo-ad-crush 0.45s ease forwards;
	}

	.neo-ads-egg-popup-stamped .neo-ads-egg-stamp {
		animation: neo-ad-stamp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.neo-ads-egg-finale {
		position: relative;
		z-index: 10;
		margin: 0 auto;
		max-width: 22rem;
		padding: 1.25rem;
		animation: neo-ad-finale 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both;
	}

	@keyframes neo-ad-drop {
		from {
			opacity: 0;
			transform: translateY(-1.5rem) rotate(-8deg) scale(0.92);
		}
		to {
			opacity: 1;
		}
	}

	@keyframes neo-ad-stamp {
		to {
			opacity: 0.92;
			transform: scale(1) rotate(-12deg);
		}
	}

	@keyframes neo-ad-crush {
		to {
			opacity: 0.35;
			filter: grayscale(0.6);
			transform: scale(0.94) rotate(0deg);
		}
	}

	@keyframes neo-ad-finale {
		from {
			opacity: 0;
			transform: translateY(1rem) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	:global([data-reduce-motion]) .neo-ads-egg-popup,
	:global([data-reduce-motion]) .neo-ads-egg-finale,
	:global([data-reduce-motion]) .neo-ads-egg-stamp {
		animation: none !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.neo-ads-egg-popup,
		.neo-ads-egg-finale,
		.neo-ads-egg-stamp {
			animation: none !important;
		}
	}
</style>
