<script lang="ts">
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import FaqList from '$lib/components/FaqList.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';

	const features = [
		{
			icon: 'fa-qrcode',
			bg: 'var(--app-accent)',
			title: 'QR & manual setup',
			desc: 'Paste otpauth:// URIs or type a Base32 secret. No camera required.'
		},
		{
			icon: 'fa-clock',
			bg: 'var(--app-accent-alt2)',
			title: 'Chunky countdown',
			desc: 'Bold timer bar — you see exactly when the code rotates.'
		},
		{
			icon: 'fa-copy',
			bg: 'var(--app-accent-alt)',
			title: 'One-click copy',
			desc: 'Big button. Satisfying click. Clipboard done.'
		},
		{
			icon: 'fa-mobile-screen',
			bg: 'var(--app-accent)',
			title: 'Installable PWA',
			desc: 'Pin to home screen. Feels native, stays web.'
		},
		{
			icon: 'fa-palette',
			bg: 'var(--app-accent-alt2)',
			title: 'Four themes',
			desc: 'Zine, Ink, Voltage, Bubble — all neo-brutalist, all loud.'
		},
		{
			icon: 'fa-server',
			bg: 'var(--app-accent-alt)',
			title: 'Self-hostable',
			desc: 'Vercel + Supabase in minutes. AGPL licensed.'
		}
	];

	const deepDives = [
		{
			title: 'TOTP that actually works',
			body: 'LibreAuth implements RFC 6238 using the Web Crypto API. Codes generate locally — your secret never leaves the browser during computation. Six digits, thirty-second window, SHA-1 — the standard every major service expects.',
			bullets: [
				'GitHub, Google, AWS, Discord compatible',
				'Manual Base32 entry fallback',
				'otpauth:// URI parser built in'
			]
		},
		{
			title: 'Sync without surrender',
			body: 'Optional Supabase backup stores your account labels and secrets under row-level security. Only your authenticated user ID can read or write your rows. No shared tables, no admin backdoor.',
			bullets: [
				'RLS on every query',
				'HTTP-only session cookies',
				'Self-host your own Supabase project'
			]
		},
		{
			title: 'Design you can feel',
			body: 'Neo-brutalism is not decoration — it is clarity. Hard edges mean obvious click targets. High contrast means readable codes. Four themes mean your vault matches your mood.',
			bullets: [
				'Zine, Ink, Voltage, Bubble themes',
				'IBM Plex Mono for codes',
				'PWA install on mobile'
			]
		}
	];

	const faqs = [
		{
			q: 'Does it support 8-digit codes?',
			a: 'Currently six-digit SHA-1 at 30 seconds — the most common setup. Eight-digit and SHA-256 support is on the roadmap.'
		},
		{
			q: 'Can I import from Google Authenticator?',
			a: "Export from your old app if it supports QR export, then paste the otpauth URI into LibreAuth. Google's export flow varies by platform."
		},
		{
			q: 'Offline mode?',
			a: 'Once loaded, codes generate offline in the browser. Sync requires network, but reading codes does not.'
		}
	];
</script>

<SeoHead
	title="Features"
	description="TOTP generation, QR import, Supabase sync, PWA install, four themes, and self-hosting — every LibreAuth feature for modern 2FA."
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'Features', path: '/features' }
	]}
	{faqs}
/>

<div class="neo-shell">
	<MarketingHeader title="Features" />

	<main class="mx-auto max-w-[1100px] px-4 py-12 sm:px-6">
		<div class="neo-card mx-auto max-w-2xl p-8 text-center">
			<p class="text-base leading-7 font-medium text-(--app-muted)">
				Everything Google Authenticator does — plus a design system that did not give up,
				documentation you can read, and source code you can audit.
			</p>
		</div>

		<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as item}
				<div class="neo-card p-6">
					<div
						class="mb-4 inline-flex h-11 w-11 items-center justify-center border-[3px] border-(--app-border) shadow-[3px_3px_0_var(--app-shadow-color)]"
						style="background: {item.bg}"
					>
						<i class="fa-solid {item.icon}"></i>
					</div>
					<h3 class="text-lg font-bold">{item.title}</h3>
					<p class="mt-2 text-sm leading-6 font-medium text-(--app-muted)">{item.desc}</p>
				</div>
			{/each}
		</div>

		<section class="mt-16 space-y-8">
			<h2 class="neo-heading text-center text-2xl font-bold">Deep dives</h2>
			{#each deepDives as block, i}
				{@const headerBg =
					i === 1
						? 'var(--app-accent-alt2)'
						: i === 2
							? 'var(--app-accent-alt)'
							: 'var(--app-accent)'}
				<div class="neo-card overflow-hidden">
					<div
						class="border-b-[3px] border-(--app-border) px-6 py-4"
						style="background: {headerBg}"
					>
						<h3 class="text-lg font-bold">{block.title}</h3>
					</div>
					<div class="p-6">
						<p class="text-sm leading-7 font-medium text-(--app-muted)">{block.body}</p>
						<ul class="mt-4 space-y-2">
							{#each block.bullets as bullet}
								<li class="flex items-start gap-2 text-sm font-semibold">
									<i class="fa-solid fa-check mt-0.5 text-(--app-accent-alt2)"></i>
									{bullet}
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</section>

		<section class="mt-16">
			<h2 class="neo-heading mb-6 text-center text-2xl font-bold">Feature FAQ</h2>
			<FaqList items={faqs} />
		</section>

		<CtaBand primary={{ href: '/app', label: 'Try it now' }} />
	</main>

	<SiteFooter />
</div>
