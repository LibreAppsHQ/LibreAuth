<script lang="ts">
	import { resolve } from '$app/paths';
	import MarketingHeader from '$lib/components/MarketingHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import FaqList from '$lib/components/FaqList.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';

	const dataTable = [
		{ type: 'Email address', purpose: 'Account login', retention: 'Until you delete account' },
		{ type: 'Password hash', purpose: 'Authentication', retention: 'Managed by Supabase Auth' },
		{ type: 'TOTP labels', purpose: 'Display in vault', retention: 'Until you delete entry' },
		{ type: 'TOTP secrets', purpose: 'Sync across devices', retention: 'Until you delete entry' },
		{ type: 'Session cookies', purpose: 'Keep you signed in', retention: 'Until logout or expiry' }
	];
</script>

<SeoHead
	title="Privacy Policy"
	description="LibreAuth privacy policy: minimal data collection, no ads, optional PostHog on marketing pages only, and no analytics inside your TOTP vault."
	breadcrumbs={[
		{ name: 'Home', path: '/' },
		{ name: 'Privacy', path: '/privacy' }
	]}
	faqs={[
		{
			q: 'Do you see my TOTP codes?',
			a: 'No. Codes generate in your browser. We never compute or log them server-side.'
		},
		{
			q: 'Cookies?',
			a: 'Session cookies keep you signed in. Optional PostHog analytics load only after you accept the cookie banner, and only on marketing/auth pages — never inside the vault.'
		},
		{
			q: 'GDPR / CCPA?',
			a: 'Minimal data collection helps compliance, but self-hosting gives you the cleanest path for EU or California users.'
		}
	]}
/>

<div class="neo-shell">
	<MarketingHeader title="Privacy" />

	<main class="mx-auto max-w-[900px] px-4 py-12 sm:px-6">
		<div class="neo-card p-8">
			<span class="neo-badge">Plain language</span>
			<p class="mt-4 text-sm leading-7 font-medium text-(--app-muted)">
				We collect the minimum needed to run a synced authenticator. We do not build advertising
				profiles, sell data, or run trackers on the app dashboard. This policy describes the default
				hosted behavior — self-hosted instances are your responsibility.
			</p>
		</div>

		<section class="mt-10">
			<h2 class="neo-heading mb-5 text-xl font-bold">Data we store</h2>
			<div class="neo-card overflow-x-auto p-0">
				<table class="w-full min-w-[540px] text-left text-sm">
					<thead>
						<tr class="border-b-[3px] border-(--app-border) bg-(--app-accent-alt2)">
							<th class="px-4 py-3 font-bold">Data</th>
							<th class="px-4 py-3 font-bold">Why</th>
							<th class="px-4 py-3 font-bold">How long</th>
						</tr>
					</thead>
					<tbody>
						{#each dataTable as row, i}
							<tr class="border-b-[3px] border-(--app-border) {i % 2 ? 'bg-(--app-hover)' : ''}">
								<td class="px-4 py-3 font-semibold">{row.type}</td>
								<td class="px-4 py-3 text-(--app-muted)">{row.purpose}</td>
								<td class="px-4 py-3 text-(--app-muted)">{row.retention}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<div class="neo-prose mt-10 space-y-6">
			<div class="neo-card p-6">
				<h2 class="!mt-0 text-xl font-bold">What we do not do</h2>
				<ul class="mt-3 space-y-2">
					<li>No advertising or sponsored placements.</li>
					<li>No behavioral profiling or cross-site ad tracking.</li>
					<li>No analytics inside the authenticator vault, add flow, or settings.</li>
					<li>No selling or renting user data to brokers.</li>
					<li>No training AI models on your TOTP secrets — obviously.</li>
				</ul>
			</div>

			<div class="neo-card p-6">
				<h2 class="!mt-0 text-xl font-bold">Third-party processors</h2>
				<p class="mt-3">
					Hosted LibreAuth uses Supabase (database + auth), Vercel (hosting), and optionally PostHog
					(product analytics on marketing pages only, after cookie consent). Self-hosting removes
					Vercel from the chain; you choose whether to enable PostHog.
				</p>
			</div>

			<div class="neo-card-sm p-6">
				<h2 class="!mt-0 text-xl font-bold">Your rights</h2>
				<p class="mt-3">
					Delete individual TOTP entries anytime from the app. Delete your account from
					<a href={resolve('/app/settings')} class="neo-link">Settings</a> (hosted app) or your self-hosted
					admin. Export is manual today — copy secrets from each entry. Full export bundle is planned.
				</p>
			</div>

			<div class="neo-card-flat border-[3px] border-dashed border-(--app-border) p-6">
				<h2 class="!mt-0 text-xl font-bold">Self-hosted instances</h2>
				<p class="mt-3">
					When you deploy LibreAuth yourself, you become the data controller. Update this policy for
					your users, choose your region, and control retention yourself.
				</p>
			</div>
		</div>

		<section id="cookies" class="mt-10 scroll-mt-24">
			<h2 class="neo-heading mb-5 text-xl font-bold">Cookies & local storage</h2>
			<div class="neo-card p-6">
				<ul class="space-y-3 text-sm leading-7 text-(--app-muted)">
					<li>
						<strong class="text-(--app-text)">Session cookies</strong> — set when you sign in so LibreAuth
						can keep you authenticated. Required for sync. Cleared on logout or expiry.
					</li>
					<li>
						<strong class="text-(--app-text)">Theme preference</strong> — stored in your browser local
						storage so your chosen theme persists. Not shared with us or third parties.
					</li>
					<li>
						<strong class="text-(--app-text)">Cookie consent</strong> — we remember that you saw this
						notice so we do not nag you every visit.
					</li>
					<li>
						<strong class="text-(--app-text)">PostHog analytics</strong> — only after you accept this
						banner, and only on marketing and auth pages (homepage, pricing, sign-in, etc.). Not loaded
						on your vault, add-account, or settings screens.
					</li>
				</ul>
				<p class="mt-4 text-sm leading-7 text-(--app-muted)">
					We do not use advertising cookies or cross-site tracking. Use
					<strong class="text-(--app-text)">Cookie settings</strong> in the footer to reopen the banner.
				</p>
			</div>
		</section>

		<section class="mt-12">
			<h2 class="neo-heading mb-5 text-xl font-bold">Privacy FAQ</h2>
			<FaqList
				items={[
					{
						q: 'Do you see my TOTP codes?',
						a: 'No. Codes generate in your browser. We never compute or log them server-side.'
					},
					{
						q: 'Cookies?',
						a: 'Session cookies keep you signed in. Optional PostHog analytics load only after you accept the cookie banner, and only on marketing/auth pages — never inside the vault.'
					},
					{
						q: 'GDPR / CCPA?',
						a: 'Minimal data collection helps compliance, but self-hosting gives you the cleanest path for EU or California users.'
					}
				]}
			/>
		</section>

		<CtaBand
			title="Privacy you can verify."
			desc="Open source. Read the schema. Run your own Supabase."
			primary={{ href: '/security', label: 'Security docs' }}
		/>
	</main>

	<SiteFooter />
</div>
