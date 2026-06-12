<script lang="ts">
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import FaqList from '$lib/components/FaqList.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';

	const launched = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const timeline = [
		{
			label: launched,
			event: 'LibreAuth goes live — neo-brutalist UI, Supabase sync, AGPL license.'
		},
		{ label: 'Next up', event: 'Client-side vault encryption and full export bundles.' },
		{ label: 'Always', event: 'No ads, consent-based analytics, no made-up backstory.' }
	];

	const faqs = [
		{
			q: 'Who is LibreAuth for?',
			a: 'Developers, privacy-conscious users, and anyone tired of closed-source MFA apps that feel like afterthoughts.'
		},
		{
			q: 'How is this different from LibreSearch?',
			a: 'Same design philosophy — loud, honest, open source — applied to two-factor auth instead of search.'
		},
		{
			q: 'Will you sell my data?',
			a: 'No. There is no ad network and no data broker. Optional PostHog analytics (after cookie consent) help us improve the product — we do not sell your data.'
		}
	];
</script>

<SeoHead
	title="About"
	description="Why LibreAuth exists: an open-source two-factor authenticator with bold design, Supabase sync, and no ads or dark patterns."
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about' }
	]}
	{faqs}
/>

<div class="neo-shell">
	<MarketingHeader title="About" />

	<main class="mx-auto max-w-[900px] px-4 py-12 sm:px-6">
		<div class="neo-card p-8">
			<span class="neo-badge">Manifesto</span>
			<p class="mt-6 text-base leading-8 font-medium text-(--app-muted)">
				Authenticator apps treat design like an afterthought — grey cards, soft shadows, zero
				personality. LibreAuth is the opposite: neo-brutalist, open source, and honest about what it
				does.
			</p>
			<p class="mt-4 text-base leading-8 font-medium text-(--app-muted)">
				We believe security software should be inspectable, portable, and — yes — fun to look at.
				When a tool guards your accounts, you should understand how it works and trust who built it.
			</p>
		</div>

		<section class="mt-10">
			<h2 class="neo-heading mb-5 text-xl font-bold">Our principles</h2>
			<div class="grid gap-5 sm:grid-cols-2">
				{#each [{ title: 'Transparent', desc: 'Public code. Clear security docs. No "trust us" hand-waving.', icon: 'fa-eye' }, { title: 'Portable', desc: 'Standard TOTP. Export anytime. No lock-in games.', icon: 'fa-suitcase' }, { title: 'Minimal data', desc: 'Only what sync needs. Optional PostHog after consent — never your TOTP secrets.', icon: 'fa-database' }, { title: 'Self-hostable', desc: 'Your Supabase, your rules, your residency.', icon: 'fa-server' }] as item}
					<div class="neo-card-sm p-6">
						<i class="fa-solid {item.icon} text-lg text-(--app-accent-alt)"></i>
						<h3 class="mt-3 text-lg font-bold">{item.title}</h3>
						<p class="mt-2 text-sm leading-6 font-medium text-(--app-muted)">{item.desc}</p>
					</div>
				{/each}
			</div>
		</section>

		<section class="mt-12">
			<h2 class="neo-heading mb-5 text-xl font-bold">Roadmap</h2>
			<div class="neo-card-flat divide-y-[3px] divide-(--app-border)">
				{#each timeline as item}
					<div class="flex gap-6 p-5 sm:p-6">
						<span class="neo-code shrink-0 text-sm sm:text-base">{item.label}</span>
						<p class="text-sm leading-7 font-medium text-(--app-muted)">{item.event}</p>
					</div>
				{/each}
			</div>
		</section>

		<section class="mt-12">
			<div class="neo-card overflow-hidden">
				<div class="bg-(--app-accent) px-6 py-4">
					<h2 class="text-lg font-bold">What we are not building</h2>
				</div>
				<ul
					class="space-y-0 divide-y-[3px] divide-(--app-border) p-6 text-sm leading-7 font-medium text-(--app-muted)"
				>
					<li class="pb-4">A social network with MFA bolted on.</li>
					<li class="py-4">A proprietary vault that holds your secrets hostage.</li>
					<li class="py-4">An ad-supported "free tier" that sells your attention.</li>
					<li class="pt-4">Enterprise bloatware with a 40-page sales deck.</li>
				</ul>
			</div>
		</section>

		<section class="mt-12">
			<h2 class="neo-heading mb-5 text-xl font-bold">FAQ</h2>
			<FaqList items={faqs} />
		</section>

		<CtaBand
			title="Join the loud security club."
			primary={{ href: '/app/register', label: 'Create free account' }}
		/>
	</main>

	<SiteFooter />
</div>
