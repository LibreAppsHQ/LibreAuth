<script lang="ts">
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import FaqList from '$lib/components/FaqList.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';

	const tiers = [
		{
			name: 'Free',
			price: '$0',
			stamp: 'Popular',
			desc: 'Full app. No catch. No "pro" tier hiding basic features.',
			features: [
				'Unlimited TOTP accounts',
				'Supabase cloud sync',
				'All 4 neo-brutalist themes',
				'PWA install on any device',
				'Copy + countdown timer',
				'Community support via GitHub'
			],
			cta: 'Get started',
			href: '/app/register',
			highlight: true
		},
		{
			name: 'Self-hosted',
			price: 'Your stack',
			stamp: 'AGPL',
			desc: 'Own the whole pipeline. Pay only for infra you choose.',
			features: [
				'Full source code access',
				'Your data residency',
				'Custom Supabase auth rules',
				'Zero license fee ever',
				'Modify UI or fork freely',
				'Deploy on Vercel, Node, Docker'
			],
			cta: 'Read README',
			href: 'https://github.com/LibreAppsHQ/LibreAuth',
			highlight: false
		}
	];

	const costEstimate = [
		{
			service: 'Supabase (free tier)',
			cost: '$0/mo',
			note: '50k MAU, 500MB DB — plenty for personal use'
		},
		{ service: 'Vercel (hobby)', cost: '$0/mo', note: 'Static + serverless deploy' },
		{ service: 'Custom domain', cost: '~$12/yr', note: 'Optional — looks professional' }
	];

	const pricingFaqs = [
		{
			q: 'Will you add a paid tier later?',
			a: 'Not for core TOTP features. Optional hosted convenience or support contracts might exist someday — the app stays AGPL.'
		},
		{
			q: 'Do I need a paid Supabase plan?',
			a: 'Not for personal use. Free tier handles thousands of auth users. Scale up only if you outgrow limits.'
		},
		{
			q: 'Can my company use LibreAuth internally?',
			a: 'Yes. AGPL applies if you modify and distribute. Internal use without distribution is unrestricted.'
		}
	];
</script>

<SeoHead
	title="Pricing"
	description="LibreAuth is free and open source forever. No premium paywall for TOTP, sync, or themes — self-host under AGPL at zero license cost."
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'Pricing', path: '/pricing' }
	]}
	faqs={pricingFaqs}
/>

<div class="neo-shell">
	<MarketingHeader title="Pricing" />

	<main class="mx-auto max-w-[960px] px-4 py-12 sm:px-6">
		<div class="neo-card p-8 text-center">
			<span class="neo-sticker">No upsells</span>
			<p class="mt-4 text-base leading-7 font-medium text-(--app-muted)">
				No subscriptions. No per-seat fees. No "enterprise contact sales" gate on basic security.
				LibreAuth is free because MFA should not be a profit center.
			</p>
		</div>

		<div class="mt-10 grid gap-6 sm:grid-cols-2">
			{#each tiers as tier}
				<div class="neo-card relative p-8 {tier.highlight ? 'bg-(--app-accent)/20' : ''}">
					<span class="neo-badge absolute -top-3 right-4">{tier.stamp}</span>
					<h3 class="text-xl font-bold">{tier.name}</h3>
					<p class="neo-heading mt-2 text-4xl font-bold">{tier.price}</p>
					<p class="mt-2 text-sm font-medium text-(--app-muted)">{tier.desc}</p>
					<ul class="mt-6 space-y-2 text-sm font-semibold">
						{#each tier.features as f}
							<li class="flex items-start gap-2">
								<i class="fa-solid fa-check mt-0.5 shrink-0"></i>
								{f}
							</li>
						{/each}
					</ul>
					<a href={tier.href} class="neo-btn neo-btn-primary mt-8 w-full">{tier.cta}</a>
				</div>
			{/each}
		</div>

		<section class="mt-14">
			<h2 class="neo-heading mb-5 text-xl font-bold">Self-host cost estimate</h2>
			<p class="mb-5 text-sm font-medium text-(--app-muted)">
				Real numbers for running your own instance — still cheaper than a coffee habit.
			</p>
			<div class="neo-card overflow-hidden p-0">
				{#each costEstimate as row, i}
					<div
						class="flex flex-col gap-1 border-b-[3px] border-(--app-border) p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between {i %
						2
							? 'bg-(--app-hover)'
							: ''}"
					>
						<div>
							<p class="font-bold">{row.service}</p>
							<p class="text-sm text-(--app-muted)">{row.note}</p>
						</div>
						<p class="neo-code text-lg">{row.cost}</p>
					</div>
				{/each}
			</div>
		</section>

		<section class="mt-14">
			<h2 class="neo-heading mb-5 text-xl font-bold">What you never pay for</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each ['Export fees', 'Multi-device tax', 'Theme unlocks', 'Priority support upsell', 'Account limits', 'Ad removal'] as item}
					<div class="neo-card-sm flex items-center gap-3 px-5 py-4">
						<i class="fa-solid fa-ban text-(--app-accent-alt)"></i>
						<span class="font-bold">{item}</span>
					</div>
				{/each}
			</div>
		</section>

		<section class="mt-14">
			<h2 class="neo-heading mb-5 text-xl font-bold">Pricing FAQ</h2>
			<FaqList items={pricingFaqs} />
		</section>

		<CtaBand />
	</main>

	<SiteFooter />
</div>
