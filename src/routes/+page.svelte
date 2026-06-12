<script lang="ts">
	import LivePreviewDemo from '$lib/components/LivePreviewDemo.svelte';
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import NoAdsEasterEgg from '$lib/components/NoAdsEasterEgg.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let adsEggOpen = $state(false);
</script>

<SeoHead
	title="Open Source TOTP Authenticator"
	description="LibreAuth is a free, open-source 2FA app with neo-brutalist design. Generate TOTP codes in your browser, sync accounts with Supabase, and self-host under AGPL."
	includeOrganization
	includeWebSite
	includeSoftware
/>

<div class="neo-shell">
	<MarketingHeader />
	<NoAdsEasterEgg bind:open={adsEggOpen} />

	<main class="mx-auto max-w-[1100px] px-4 pt-10 pb-20 sm:px-6 sm:pt-16">
		<section class="relative text-center">
			<button
				type="button"
				class="neo-sticker neo-sticker-secret absolute -top-2 right-0 hidden sm:inline-block"
				aria-label="No ads ever — click for a surprise"
				onclick={() => (adsEggOpen = true)}
			>
				No ads ever
			</button>

			<div class="neo-card mx-auto max-w-3xl p-8 sm:p-12">
				<Logo class="mx-auto h-12 justify-center sm:h-14" />
				<h1 class="neo-heading neo-heading-xl mt-6">
					2FA codes.<br />
					<span class="bg-(--app-accent) px-2">Zero corporate mush.</span>
				</h1>
				<p class="mx-auto mt-5 max-w-lg text-base leading-7 font-medium text-(--app-muted)">
					LibreAuth is an open-source authenticator that looks like a zine and works like a vault.
					Paste a setup key, sync with Supabase, copy codes before the timer wins.
				</p>

				<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
					<a href="/app" class="neo-btn neo-btn-primary px-8 py-3">Launch app</a>
					<a href="/features" class="neo-btn neo-btn-ghost px-8 py-3">See features</a>
				</div>
			</div>
		</section>

		<section class="mt-16 grid gap-5 sm:grid-cols-3">
			{#each [{ icon: 'fa-lock', color: 'var(--app-accent)', title: 'Real TOTP', desc: 'GitHub, Google, AWS — anything with a QR or secret key.' }, { icon: 'fa-cloud', color: 'var(--app-accent-alt2)', title: 'Supabase sync', desc: 'Your codes on every device. Row-level security baked in.' }, { icon: 'fa-ban', color: 'var(--app-accent-alt)', title: 'No spyware', desc: 'Codes generate in-browser. We are not monetizing your MFA.' }] as item, i}
				<div class="neo-card animate-neo-pop p-6" style="animation-delay: {i * 60}ms">
					<div
						class="mb-4 inline-flex h-11 w-11 items-center justify-center border-[3px] border-(--app-border) text-lg shadow-[3px_3px_0_var(--app-shadow-color)]"
						style="background: {item.color}"
					>
						<i class="fa-solid {item.icon}"></i>
					</div>
					<h3 class="text-lg font-bold">{item.title}</h3>
					<p class="mt-2 text-sm leading-6 font-medium text-(--app-muted)">{item.desc}</p>
				</div>
			{/each}
		</section>

		<section class="mt-16">
			<div class="neo-card-flat overflow-hidden">
				<div class="grid md:grid-cols-2">
					<div class="border-b-[3px] border-(--app-border) p-8 md:border-r-[3px] md:border-b-0">
						<LivePreviewDemo />
					</div>
					<div class="bg-(--app-accent-alt2) p-8">
						<h2 class="neo-heading text-2xl font-bold">Built different on purpose.</h2>
						<p class="mt-3 text-sm leading-7 font-medium">
							Thick borders. Hard shadows. Colors that slap. Security tools do not have to look like
							enterprise SaaS from 2014.
						</p>
						<a href="/about" class="neo-btn neo-btn-primary mt-6">Why we built this</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<SiteFooter />
</div>
