<script lang="ts">
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import FaqList from '$lib/components/FaqList.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';

	const flow = [
		{ step: 'Browser', desc: 'Web Crypto generates TOTP from secret in memory' },
		{ step: 'Supabase', desc: 'Encrypted TLS stores secrets with RLS per user' },
		{ step: 'Session', desc: 'HTTP-only cookies validate auth server-side' }
	];

	const faqs = [
		{
			q: 'Can LibreAuth staff read my secrets?',
			a: 'On the default hosted setup, secrets are stored in Supabase with RLS — not accessible to other users. Client-side vault encryption is planned so even DB operators cannot read them.'
		},
		{
			q: 'What happens if Supabase is down?',
			a: 'Already-loaded accounts still generate codes in your browser. You cannot sync new entries until service restores.'
		},
		{
			q: 'Is Web Crypto safe for TOTP?',
			a: 'Yes. HMAC-SHA1 via crypto.subtle is the standard approach for browser-based authenticators and is used by major web apps.'
		}
	];
</script>

<SeoHead
	title="Security"
	description="How LibreAuth protects TOTP secrets: browser-side code generation, Supabase row-level security, HTTP-only sessions, and consent-based PostHog analytics that never sees your codes."
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'Security', path: '/security' }
	]}
	{faqs}
/>

<div class="neo-shell">
	<MarketingHeader title="Security" />

	<main class="mx-auto max-w-[900px] px-4 py-12 sm:px-6">
		<div class="neo-card p-8">
			<span class="neo-badge">Threat model</span>
			<p class="mt-4 text-sm leading-7 font-medium text-(--app-muted)">
				LibreAuth protects against unauthorized access to your TOTP secrets and session. It does not
				protect against a compromised device, shoulder surfing, or phishing — use backup codes and
				hardware keys for high-value accounts.
			</p>
		</div>

		<section class="mt-10">
			<h2 class="neo-heading mb-5 text-xl font-bold">Data flow</h2>
			<div class="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
				{#each flow as item, i}
					<div class="neo-card-sm flex-1 p-5 text-center">
						<span class="neo-badge">{i + 1}</span>
						<h3 class="mt-3 font-bold">{item.step}</h3>
						<p class="mt-2 text-sm font-medium text-(--app-muted)">{item.desc}</p>
					</div>
					{#if i < flow.length - 1}
						<i class="fa-solid fa-arrow-right hidden shrink-0 text-xl text-(--app-muted) sm:block"
						></i>
					{/if}
				{/each}
			</div>
		</section>

		<div class="neo-prose mt-10 space-y-6">
			<div class="neo-card p-6">
				<h2 class="!mt-0 text-xl font-bold">Architecture</h2>
				<p class="mt-3">
					Codes compute in your browser via Web Crypto (RFC 6238). Secrets live in Supabase behind
					row-level security — only your user ID touches your rows. No server-side TOTP generation.
				</p>
			</div>

			<div class="neo-card p-6">
				<h2 class="!mt-0 text-xl font-bold">Authentication</h2>
				<p class="mt-3">
					Supabase Auth + <code>@supabase/ssr</code> cookies. Protected routes validate sessions server-side
					before render. Logout clears cookies via server endpoint.
				</p>
			</div>

			<div class="neo-card p-6">
				<h2 class="!mt-0 text-xl font-bold">Database policies</h2>
				<p class="mt-3">
					Every <code>totp_entries</code> row is scoped to <code>auth.uid()</code>:
				</p>
				<ul class="mt-3 space-y-2">
					<li>SELECT — own rows only</li>
					<li>INSERT — must match authenticated user</li>
					<li>UPDATE / DELETE — own rows only</li>
				</ul>
			</div>

			<div class="neo-card p-6">
				<h2 class="!mt-0 text-xl font-bold">Product analytics</h2>
				<p class="mt-3">
					Hosted LibreAuth uses PostHog after cookie consent to understand how people use marketing
					pages and the signed-in app. We capture pageviews and identify signed-in users — not TOTP
					secrets, QR payloads, or generated codes. Autocapture and session replay are disabled.
				</p>
			</div>

			<div class="neo-card-sm p-6">
				<h2 class="!mt-0 text-xl font-bold">Recommendations</h2>
				<ul class="mt-3 space-y-2">
					<li>Strong unique password for your LibreAuth account.</li>
					<li>Enable email confirmation in Supabase for production.</li>
					<li>Self-host for full data control and custom auth policies.</li>
					<li>Keep service backup codes — authenticators are not account recovery.</li>
					<li>Use a password manager alongside 2FA for defense in depth.</li>
				</ul>
			</div>

			<div class="neo-card-flat border-[3px] border-dashed border-(--app-border) p-6">
				<h2 class="!mt-0 text-xl font-bold">Roadmap</h2>
				<p class="mt-3">
					Client-side vault encryption with a separate passphrase — secrets opaque even to the
					database operator. Export/import bundle. Hardware key login for the vault itself.
				</p>
			</div>
		</div>

		<section class="mt-12">
			<h2 class="neo-heading mb-5 text-xl font-bold">Security FAQ</h2>
			<FaqList items={faqs} />
		</section>

		<CtaBand
			title="Read the code yourself."
			desc="AGPL licensed. Audit the repo, run the migration, deploy your own instance."
			primary={{ href: 'https://github.com/LibreAppsHQ/LibreAuth', label: 'View on GitHub' }}
			secondary={{ href: '/privacy', label: 'Privacy policy' }}
		/>
	</main>

	<SiteFooter />
</div>
